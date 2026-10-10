<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class GitHubConsultorController extends Controller
{
    public function index()
    {
        $token = env('GITHUB_TOKEN');
        $username = env('GITHUB_USERNAME');

        // Fetch user repositories sorted by updated_at descending
        $reposResponse = Http::withToken($token)
            ->withoutVerifying()
            ->get("https://api.github.com/user/repos", [
                'sort' => 'updated',
                'direction' => 'desc',
                'per_page' => 100
            ]);

        // Fetch recent user events (includes private if token allows)
        $eventsResponse = Http::withToken($token)
            ->withoutVerifying()
            ->get("https://api.github.com/users/{$username}/events", [
                'per_page' => 100
            ]);
        
        // Parse out the latest 50 commits from PushEvents
        $commits = collect($eventsResponse->json())
            ->filter(fn($event) => isset($event['type']) && $event['type'] === 'PushEvent')
            ->flatMap(function ($event) {
                return collect($event['payload']['commits'] ?? [])->map(function ($commit) use ($event) {
                    return [
                        'id' => $commit['sha'],
                        'message' => $commit['message'],
                        'author_name' => $commit['author']['name'] ?? $event['actor']['login'],
                        'repo_name' => $event['repo']['name'],
                        'created_at' => $event['created_at'],
                        'avatar_url' => $event['actor']['avatar_url'] ?? null,
                    ];
                });
            })
            ->take(50)
            ->values()
            ->all();

        return Inertia::render('GitHubConsultor/Index', [
            'repos' => $reposResponse->json(),
            'commits' => $commits,
            'username' => $username,
        ]);
    }

    public function proyectos()
    {
        $token = env('GITHUB_TOKEN');
        $username = env('GITHUB_USERNAME');

        // Fetch user repositories sorted by updated_at descending
        $reposResponse = Http::withToken($token)
            ->withoutVerifying()
            ->get("https://api.github.com/user/repos", [
                'sort' => 'updated',
                'direction' => 'desc',
                'per_page' => 50
            ]);

        $repos = $reposResponse->json();

        if (is_array($repos)) {
            // Fetch last commit for each repo concurrently
            $responses = \Illuminate\Support\Facades\Http::pool(function (\Illuminate\Http\Client\Pool $pool) use ($repos, $token) {
                    foreach ($repos as $repo) {
                        if (isset($repo['full_name'])) {
                            $pool->as($repo['full_name'])
                                ->withToken($token)
                                ->withoutVerifying()
                                ->get("https://api.github.com/repos/{$repo['full_name']}/commits", [
                                    'per_page' => 1
                                ]);
                        }
                    }
                });

            // Map the commit data into the repos array
            foreach ($repos as &$repo) {
                if (isset($repo['full_name']) && isset($responses[$repo['full_name']])) {
                    $response = $responses[$repo['full_name']];
                    // Check if it's a valid Response and not an Exception
                    if ($response instanceof \Illuminate\Http\Client\Response && $response->ok()) {
                        $commits = $response->json();
                        if (!empty($commits) && isset($commits[0]['commit'])) {
                            $repo['last_commit_message'] = $commits[0]['commit']['message'] ?? null;
                            $repo['last_commit_author'] = $commits[0]['commit']['author']['name'] ?? $repo['owner']['login'];
                        }
                    }
                }
            }
        }

        return Inertia::render('GitHubConsultor/Proyectos', [
            'repos' => $repos,
            'username' => $username,
        ]);
    }
}
