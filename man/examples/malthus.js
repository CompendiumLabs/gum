// Draw a plot of a function increases from below zero to a maximum value of nbar. Indicate with vertical and horizontal lines where this line cross zero and a positive threshhold g_z / alpha. Label these intersection points on the axis, along with nbar and zero. Let the x-axis label be "Standard of Living (y)", the y-axis label be "Population Growth (gL)", and the title be "Modified Demographic Function".
let nbar = 2; let ybar = 1; let theta = 1; let gz = 0.5; let alpha = 0.5;
let gza = gz/alpha; let ystar = ybar + gza/theta;
let xlim = [xlo, xhi] = [0, 5]; let ylim = [ylo, yhi] = [-2, 3];
let demo = y => min(nbar, theta*(y-ybar));
let path = SymPath({fy: demo, xlim});
let zero1 = HLine(0, {lim: xlim, opacity: 0.2});
let zero2 = VLine(ybar, {lim: ylim, opacity: 0.2});
let line1 = HLine(gza, {lim: xlim, stroke_dasharray: 3});
let line2 = VLine(ystar, {lim: ylim, stroke_dasharray: 3});
let dot = Points([[ystar, gza]], {size: 0.04});
let xticks = [[1, Latex('\\bar{y}')], [ystar, Latex('y^{\\ast}')], [xhi, '']];
let yticks = [[0, '0'], [gz/alpha, Latex('\\frac{g_z}{\\alpha}')], [nbar, Latex('\\bar{n}')], [yhi, '']];
let plot = Plot([path, zero1, zero2, line1, line2, dot], {
  aspect: phi, xlim, ylim, xticks, yticks, xlabel: 'Standard of living (y)',
  ylabel: 'Population growth (gL)', title: 'Modified Demographic Function'
});
let frame = Frame(plot, {margin: 0.25});
return frame;
