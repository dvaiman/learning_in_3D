# Difficulty, time, and learning: a three-dimensional framework

An interactive 3D visualisation that integrates the **challenge point framework**, **desirable difficulties**, **cognitive load theory**, and **cognitive offloading** into a single discussion tool for educators and researchers.

**Live site:** https://dvaiman.github.io/learning_in_3D/

## What it shows

A rotatable 3D plot with the axes:

- **Time** — duration and spacing of practice
- **Difficulty** — functional task difficulty, relative to learner skill
- **Learning** — long-term retention and transfer

Four learner trajectories are drawn through this space:

| Trajectory | Colour | What it represents |
|---|---|---|
| Spaced + progressive difficulty | Green | Optimal: difficulty rises gradually with skill |
| Massed practice, low difficulty | Blue | Lots of time, little challenge — pluggande |
| Too hard, too fast | Orange | Cognitive overload, learning collapses |
| AI-offloaded | Pink (dashed) | AI removes effort — fluency illusion |

A green ridge line with a dotted tolerance band marks the **predicted optimum** under the challenge-point framework.

Two 2D companion plots make additional dimensions explicit:

- **Effort × learning** — effort as its own axis
- **Practice vs. transfer** — visualises the fluency illusion (Bjork & Bjork; Bastani et al.)

Each trajectory has a toggle button; clicking a button shows or hides the line and reveals a short theory blurb beneath the plot. Six theory cards underneath the figures link the model to the underlying literature.

## Stack

Plain HTML, CSS, and JavaScript — no build step.

- `index.html`
- `styles.css`
- `app.js` (uses Plotly.js via CDN)

Deployed via **GitHub Pages** from `main` / `/ (root)`.

## Local preview

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## License & use

Created as a discussion tool for educators. References to the underlying learning-science literature are listed in the footer of the page.
