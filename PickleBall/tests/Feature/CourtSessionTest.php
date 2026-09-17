<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Booking\Models\Court;
use App\Modules\Booking\Models\CourtSession;
use App\Modules\Booking\Models\TimeSlot;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CourtSessionTest extends TestCase
{
    protected User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        DB::connection('booking')->table('court_sessions')->delete();
        DB::connection('booking')->table('holds')->delete();
        DB::connection('booking')->table('time_slots')->delete();
        DB::connection('booking')->table('courts')->delete();

        // Create staff user for POS operations
        $this->staff = User::factory()->create();
        $this->staff->assignRole('staff');
    }

    protected function createCourt(): Court
    {
        return Court::create([
            'name' => 'Sân Pickleball VIP 01',
            'code' => 'P-VIP-'.uniqid(),
            'surface_type' => 'cushion',
            'status' => 'active',
        ]);
    }

    public function test_staff_can_start_walk_in_session_on_available_court(): void
    {
        $court = $this->createCourt();

        $response = $this->actingAs($this->staff)->postJson("/api/v1/admin/courts/{$court->id}/start-session", [
            'customer_name' => 'Khách Nguyễn Văn A',
            'customer_phone' => '0987654321',
            'duration_minutes' => 60,
            'hourly_rate' => 140000,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.court_id', $court->id)
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.customer_name', 'Khách Nguyễn Văn A');

        $this->assertDatabaseHas('court_sessions', [
            'court_id' => $court->id,
            'customer_name' => 'Khách Nguyễn Văn A',
            'status' => 'in_progress',
        ], 'booking');
    }

    public function test_cannot_start_session_on_already_occupied_court(): void
    {
        $court = $this->createCourt();

        CourtSession::create([
            'court_id' => $court->id,
            'customer_name' => 'Khách Hiện Tại',
            'start_time' => now(),
            'hourly_rate' => 140000,
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($this->staff)->postJson("/api/v1/admin/courts/{$court->id}/start-session", [
            'customer_name' => 'Khách Mới Đến',
        ]);

        $response->assertStatus(409);
    }

    public function test_staff_can_stop_session_and_calculate_correct_pricing(): void
    {
        $court = $this->createCourt();

        // Simulate a session that started 70 minutes ago
        $session = CourtSession::create([
            'court_id' => $court->id,
            'customer_name' => 'Khách Vãng Lai',
            'start_time' => now()->subMinutes(70),
            'hourly_rate' => 140000,
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($this->staff)->postJson("/api/v1/admin/courts/{$court->id}/stop-session");

        $response->assertStatus(200);

        // 70 minutes rounded to nearest 15m block = 75 minutes = 1.25 hours
        // 1.25 * 140,000 = 175,000 VND
        $response->assertJsonPath('data.duration_minutes', 75)
            ->assertJsonPath('data.total_price', 175000);

        $this->assertDatabaseHas('court_sessions', [
            'id' => $session->id,
            'status' => 'completed',
            'duration_minutes' => 75,
            'total_price' => 175000,
        ], 'booking');
    }

    public function test_live_status_returns_active_sessions_and_availability(): void
    {
        $court1 = $this->createCourt();
        $court2 = $this->createCourt();

        // Court 1 has active session
        CourtSession::create([
            'court_id' => $court1->id,
            'customer_name' => 'Anh Long',
            'start_time' => now()->subMinutes(20),
            'hourly_rate' => 140000,
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($this->staff)->getJson('/api/v1/admin/courts/live-status');

        $response->assertStatus(200);
        $data = collect($response->json('data'));

        $court1Data = $data->firstWhere('id', $court1->id);
        $court2Data = $data->firstWhere('id', $court2->id);

        $this->assertEquals('in_use', $court1Data['status']);
        $this->assertEquals('Anh Long', $court1Data['customer_name']);

        $this->assertEquals('available', $court2Data['status']);
    }

    public function test_slots_api_marks_cutoff_for_slots_within_30_minutes(): void
    {
        $court = $this->createCourt();

        // Slot starting 10 minutes from now today
        $upcomingTime = now()->addMinutes(10)->format('H:i:00');
        $endTime = now()->addMinutes(70)->format('H:i:00');

        $slot = TimeSlot::create([
            'court_id' => $court->id,
            'date' => now()->format('Y-m-d'),
            'start_time' => $upcomingTime,
            'end_time' => $endTime,
            'price' => 140000,
            'status' => 'available',
        ]);

        $response = $this->getJson('/api/v1/slots?date=' . now()->format('Y-m-d'));

        $response->assertStatus(200);
        $slotData = collect($response->json('data'))->firstWhere('id', $slot->id);

        $this->assertTrue($slotData['is_cut_off']);
    }
}
