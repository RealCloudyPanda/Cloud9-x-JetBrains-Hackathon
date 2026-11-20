# 2. Integer fixed-point simulation at a fixed 60 Hz Tick

All simulation state is integers (positions in 1/256 px, speeds in 1/256 px per Tick, Flow in 1/1000) advanced at a fixed 60 Ticks per second, independent of display refresh. JavaScript doubles would usually replay identically on one machine, but integer math removes any doubt across browsers and makes state hashes exact; the cost is slightly clumsier tuning code and no trig or `Math.*` helpers inside `src/sim/`.
