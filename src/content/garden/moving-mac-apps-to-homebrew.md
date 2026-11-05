---
title: Moving my Mac apps to Homebrew
stage: seed
planted: 2026-11-01
tended: 2026-11-05
topics: [Tools]
---

On [Lex Fridman's podcast](https://www.youtube.com/watch?v=NYFGCESmikA&t=6747s), DHH was asked why he kept pushing Omarchy's install time under a minute. He answered with a line from Mitchell Hashimoto: "The pursuit of excellence deserves no explanation."

He also described the old Mac routine. Visit a website, download a DMG, drag an icon into Applications. He said Homebrew has fixed much of that, but not all of it.

I'm on a Mac, so I wanted to see how much of that routine was still mine.

Forty-nine apps in my Applications folder weren't managed by Homebrew. Some that should update themselves hadn't. Docker was on 4.60.1 when 4.97.0 was out. Firefox was on 147 when 159 was out.

Homebrew can take over an installed app and leave it in place (`--adopt`). It can also replace an outdated app with the current version (`--force`). Matching by name wasn't enough. One Homebrew package shared its name with an app I use, but came from a different company. So I checked bundle IDs.

The first run failed on most apps with "Operation not permitted," even with sudo. macOS's App Management protection stops programs from changing other apps. Granting it to my terminal fixed that. I only turn it on when updating. While it's on, anything I run in that terminal can change my apps.

Some apps can't move. A few aren't in Homebrew. Homebrew is also retiring Arc, because its maker discontinued it.

Homebrew now manages 30 of my apps, up from 2. Twelve were adopted as they were. Sixteen were out of date and replaced, Docker among them. Claude did most of the investigating. I ran the commands.
