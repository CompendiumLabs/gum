let camera = Group([
  Rect({ pos: [0.5, 0.5], rad: [0.42, 0.28], rounded: 0.03 }),
  Circle({ pos: [0.5, 0.5], rad: 0.15 }),
  Circle({ pos: [0.5, 0.5], rad: 0.1 }),
  Rect({ pos: [0.8, 0.35], rad: [0.04, 0.04] }),
  Rect({ pos: [0.2, 0.35], rad: [0.05, 0.05] })
]);
return SVG(camera, {size: 25, fill: 'white', stroke_width: 1.5});
