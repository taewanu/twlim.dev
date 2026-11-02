---
title: Two skills I use with Claude Code
stage: seed
planted: 2026-11-02
tended: 2026-11-02
topics: [Building with AI]
---

I build small Claude Code skills for my own work. Most are still in progress. These two are the ones I'd show.

## visual-ui-compare

It turns a visual decision into a page in the browser. Options sit side by side, and I pick by eye. For motion, it gives me sliders instead. Then it patches my pick into the code.

I built it because text is a bad way to judge a visual. I used it to choose the country selector in Sounds Abroad. [Read the skill.](https://github.com/taewanu/skills/tree/main/skills/productivity/visual-ui-compare)

## step-back-as-user

It drops the current solution and walks one moment as the user. It reports where they stall. It stops before redesigning.

I ran it on this garden before the first commit. It found that phones had no way back at the end of a note. [Read the skill.](https://github.com/taewanu/skills/tree/main/skills/engineering/step-back-as-user)

## Install

Both come with my plugin.

```
/plugin marketplace add taewanu/skills
/plugin install taewanu-skills@taewanu
```
