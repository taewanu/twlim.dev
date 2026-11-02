---
title: PR Review Agent build log
stage: seed
planted: 2026-06-12
tended: 2026-11-02
topics: [Building with AI]
---

[PR Review Agent](https://github.com/taewanu/pr-review-agent) reviews pull requests and posts its findings on GitHub. It runs on my laptop as a self-hosted GitHub App. It's bash and Python around headless Claude Code. It also reviews its own PRs.

## It reviewed itself

In [PR #95](https://github.com/taewanu/pr-review-agent/pull/95), it found a bug in the feature being added. Batching replies could delete a draft review on someone else's PR. I fixed it and added a test. It confirmed the fix.

## What the AI couldn't catch

The AI wrote a footer offering to delete each review. A submitted review can't be deleted. Both GitHub APIs return 422. I found that by making the call myself.

The daemon died silently. A launchd timer stopped firing with no error. I replaced it with an explicit loop. That loop later froze on a `git fetch` with no timeout. So I bounded the network calls.

Prompt tuning stopped improving the review's voice. So I moved those rules into a check that runs after the model writes. It checks wording and structure, never meaning.

## A decision I reversed

It first posted under my own account. That ruled out check runs, because only GitHub Apps can create them. In v0.5.0 it moved to its own App identity. It now shows a `review` check on the PR.

Testing that move on a real PR caught two bugs. Three rounds of code review had missed them.
