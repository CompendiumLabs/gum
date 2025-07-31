// Create multiple spirograph paths with different parameters
let paths = range(1, 6).map(i => {
    let R = 0.35;  // outer circle radius
    let r = R * (0.3 + 0.1 * i);  // inner circle radius
    let d = 0.7 * r;  // distance from center of inner circle

    // Parametric equations for hypotrochoid
    let fx = t => (R-r) * cos(t) + d * cos((R-r)/r * t);
    let fy = t => (R-r) * sin(t) - d * sin((R-r)/r * t);

    // Create path with varying color from blue to red
    return SymPath({
        fx, fy,
        tlim: [0, 20*pi],
        N: 1000,
        stroke: interpolate_hex(blue, red, i/5),
        stroke_width: 1.5,
        stroke_opacity: 0.7,
    });
});

// Combine paths in a graph with appropriate limits
let graph = Graph(paths, {
    xlim: [-0.5, 0.5],
    ylim: [-0.5, 0.5],
});

// Frame the result in a square with a title
return TitleFrame(graph, 'Spirograph', {
    aspect: 1,
    margin: 0.1,
    title_size: 0.08,
    border: 1,
    border_rounded: 0.02,
});
