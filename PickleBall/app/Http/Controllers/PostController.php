<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * Get published blog posts for public frontend.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::where('status', 'published');

        if ($category = $request->query('category')) {
            if ($category !== 'Tất cả') {
                $query->where('category', $category);
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $posts = $query->orderBy('created_at', 'desc')->paginate(12);

        return response()->json([
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
            'message' => 'Lấy danh sách bài viết thành công',
        ]);
    }

    /**
     * Get single blog post details by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $post = Post::where('slug', $slug)->firstOrFail();

        // Increment view count
        $post->increment('views');

        return response()->json([
            'data' => $post,
            'message' => 'Lấy chi tiết bài viết thành công',
        ]);
    }

    /**
     * Get all posts for admin (including drafts).
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Post::query();

        if ($category = $request->query('category')) {
            if ($category !== 'Tất cả') {
                $query->where('category', $category);
            }
        }

        if ($status = $request->query('status')) {
            if (in_array($status, ['published', 'draft'])) {
                $query->where('status', $status);
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $posts = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $posts,
            'message' => 'Lấy danh sách bài viết quản trị thành công',
        ]);
    }

    /**
     * Create a new post.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'image' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'status' => 'required|in:published,draft',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['author_id'] = $request->user()?->id;

        if ($validated['status'] === 'published') {
            $validated['published_at'] = now();
        }

        $post = Post::create($validated);

        return response()->json([
            'data' => $post,
            'message' => 'Tạo bài viết thành công',
        ], 210);
    }

    /**
     * Update an existing post.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string',
            'image' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'status' => 'sometimes|required|in:published,draft',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        if (isset($validated['status']) && $validated['status'] === 'published' && ! $post->published_at) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        return response()->json([
            'data' => $post,
            'message' => 'Cập nhật bài viết thành công',
        ]);
    }

    /**
     * Delete a post.
     */
    public function destroy(int $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return response()->json([
            'data' => null,
            'message' => 'Xóa bài viết thành công',
        ]);
    }
}
