<?php

namespace Tests\Feature;

use App\Modules\Booking\Models\Court;
use App\Modules\Booking\Models\Hold;
use App\Modules\Booking\Models\TimeSlot;
use App\Modules\Booking\Services\HoldService;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class BookingHoldTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        DB::connection('booking')->table('holds')->delete();
        DB::connection('booking')->table('time_slots')->delete();
        DB::connection('booking')->table('courts')->delete();
    }

    protected function createCourtAndSlot(string $status = 'available', string $startTime = '08:00:00', string $endTime = '09:00:00'): array
    {
        $court = Court::create([
            'name' => 'Sân Pickleball Test',
            'code' => 'P-TEST-'.uniqid(),
            'surface_type' => 'hard',
            'status' => 'active',
        ]);

        $slot = TimeSlot::create([
            'court_id' => $court->id,
            'date' => now()->format('Y-m-d'),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'price' => 150000,
            'status' => $status,
        ]);

        return [$court, $slot];
    }

    public function test_can_hold_an_available_time_slot(): void
    {
        [$court, $slot] = $this->createCourtAndSlot();

        $response = $this->withHeaders([
            'X-Session-Id' => 'test_sess_001',
        ])->postJson('/api/v1/booking/hold', [
            'slot_id' => $slot->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.slot_id', $slot->id)
            ->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('time_slots', [
            'id' => $slot->id,
            'status' => 'held',
        ], 'booking');

        $this->assertDatabaseHas('holds', [
            'slot_id' => $slot->id,
            'session_id' => 'test_sess_001',
            'status' => 'active',
        ], 'booking');
    }

    public function test_holding_already_held_slot_returns_409_conflict(): void
    {
        [$court, $slot] = $this->createCourtAndSlot();

        // First hold succeeds
        $this->withHeaders([
            'X-Session-Id' => 'user_one_session',
        ])->postJson('/api/v1/booking/hold', [
            'slot_id' => $slot->id,
        ])->assertStatus(201);

        // Second hold attempt on same slot returns 409 Conflict
        $response = $this->withHeaders([
            'X-Session-Id' => 'user_two_session',
        ])->postJson('/api/v1/booking/hold', [
            'slot_id' => $slot->id,
        ]);

        $response->assertStatus(409)
            ->assertJsonFragment([
                'message' => 'Khung giờ này đã được giữ chỗ hoặc đã được đặt.',
            ]);
    }

    public function test_can_manually_release_held_slot(): void
    {
        [$court, $slot] = $this->createCourtAndSlot();

        $createResponse = $this->withHeaders([
            'X-Session-Id' => 'user_session_rel',
        ])->postJson('/api/v1/booking/hold', [
            'slot_id' => $slot->id,
        ]);

        $createResponse->assertStatus(201);
        $holdId = $createResponse->json('data.id');

        // Delete/release the hold
        $releaseResponse = $this->withHeaders([
            'X-Session-Id' => 'user_session_rel',
        ])->deleteJson("/api/v1/booking/hold/{$holdId}");

        $releaseResponse->assertStatus(200);

        $this->assertDatabaseHas('time_slots', [
            'id' => $slot->id,
            'status' => 'available',
        ], 'booking');

        $this->assertDatabaseHas('holds', [
            'id' => $holdId,
            'status' => 'expired',
        ], 'booking');
    }

    public function test_expired_hold_is_automatically_reclaimed(): void
    {
        [$court, $slot] = $this->createCourtAndSlot(status: 'held');

        // Create an already-expired hold record
        $expiredHold = Hold::create([
            'slot_id' => $slot->id,
            'session_id' => 'old_session',
            'expires_at' => now()->subMinutes(15),
            'status' => 'active',
        ]);

        // Trigger cleanExpiredHolds via service
        $holdService = app(HoldService::class);
        $reclaimedCount = $holdService->cleanExpiredHolds();

        $this->assertEquals(1, $reclaimedCount);

        $this->assertDatabaseHas('time_slots', [
            'id' => $slot->id,
            'status' => 'available',
        ], 'booking');

        $this->assertDatabaseHas('holds', [
            'id' => $expiredHold->id,
            'status' => 'expired',
        ], 'booking');
    }

    public function test_cannot_hold_non_existent_slot_returns_422(): void
    {
        $response = $this->postJson('/api/v1/booking/hold', [
            'slot_id' => 999999,
        ]);

        $response->assertStatus(422);
    }
}
