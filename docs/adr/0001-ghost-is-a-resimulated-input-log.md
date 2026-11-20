# 1. A Ghost is a re-simulated Input Log, not a recorded path

A Ghost is stored as the per-Tick input changes of a Run and replayed through the same simulation, instead of storing the runner's positions. This keeps a Ghost to a few hundred bytes (many fit in localStorage) and makes every replay a determinism check, but it means any change to physics or Course data invalidates old Ghosts, so every Ghost carries a Course Version plus per-gate state hashes and mismatched Ghosts are discarded.
