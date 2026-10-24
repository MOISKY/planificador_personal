<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
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
            ->get('https://api.github.com/user/repos', [
                'sort' => 'updated',
                'direction' => 'desc',
                'per_page' => 100,
            ]);

        // Fetch recent user events (includes private if token allows)
        $eventsResponse = Http::withToken($token)
            ->withoutVerifying()
            ->get("https://api.github.com/users/{$username}/events", [
                'per_page' => 100,
            ]);

        // Parse out the latest 50 commits from PushEvents
        $commits = collect($eventsResponse->json())
            ->filter(fn ($event) => isset($event['type']) && $event['type'] === 'PushEvent')
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
            ->get('https://api.github.com/user/repos', [
                'sort' => 'updated',
                'direction' => 'desc',
                'per_page' => 50,
            ]);

        $repos = $reposResponse->json();

        if (is_array($repos)) {
            // Fetch last commit for each repo concurrently
            $responses = Http::pool(function (Pool $pool) use ($repos, $token) {
                foreach ($repos as $repo) {
                    if (isset($repo['full_name'])) {
                        $pool->as($repo['full_name'])
                            ->withToken($token)
                            ->withoutVerifying()
                            ->get("https://api.github.com/repos/{$repo['full_name']}/commits", [
                                'per_page' => 1,
                            ]);
                    }
                }
            });

            // Map the commit data into the repos array
            foreach ($repos as &$repo) {
                if (isset($repo['full_name']) && isset($responses[$repo['full_name']])) {
                    $response = $responses[$repo['full_name']];
                    // Check if it's a valid Response and not an Exception
                    if ($response instanceof Response && $response->ok()) {
                        $commits = $response->json();
                        if (! empty($commits) && isset($commits[0]['commit'])) {
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

    public function proyectoDetalle(Request $request, $owner, $repoName)
    {
        $token = env('GITHUB_TOKEN');
        $username = env('GITHUB_USERNAME');

        // Fetch repo info
        $repoInfo = Http::withToken($token)
            ->withoutVerifying()
            ->get("https://api.github.com/repos/{$owner}/{$repoName}")
            ->json();

        // Fetch up to 30 recent commits
        $commitsList = Http::withToken($token)
            ->withoutVerifying()
            ->get("https://api.github.com/repos/{$owner}/{$repoName}/commits", [
                'per_page' => 30,
            ])->json();

        $commitsWithFiles = [];

        if (is_array($commitsList)) {
            // Pool to fetch files for each commit
            $responses = Http::pool(function (Pool $pool) use ($commitsList, $owner, $repoName, $token) {
                foreach ($commitsList as $commit) {
                    if (isset($commit['sha'])) {
                        $pool->as($commit['sha'])
                            ->withToken($token)
                            ->withoutVerifying()
                            ->get("https://api.github.com/repos/{$owner}/{$repoName}/commits/{$commit['sha']}");
                    }
                }
            });

            foreach ($commitsList as $commit) {
                if (isset($commit['sha']) && isset($responses[$commit['sha']])) {
                    $response = $responses[$commit['sha']];
                    if ($response instanceof Response && $response->ok()) {
                        $commitDetails = $response->json();
                        $commit['files'] = $commitDetails['files'] ?? [];
                    } else {
                        $commit['files'] = [];
                    }
                    $commitsWithFiles[] = $commit;
                }
            }
        }

        return Inertia::render('GitHubConsultor/ProyectoDetalle', [
            'repo' => $repoInfo,
            'commits' => $commitsWithFiles,
            'username' => $username,
        ]);
    }
}
