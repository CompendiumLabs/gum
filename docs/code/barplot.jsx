// A plot with three bars with black borders at "A", "B", and "C". The first bar is red and is the shortest, the second bar is blue and is the tallest, while the third bar is gray.
<Frame margin={0.25}>
  <BarPlot ylim={[0, 10]} yticks={6} title="Example BarPlot" xlabel="Category" ylabel="Value">
    <Bar label="A" size={3} fill={red} />
    <Bar label="B" size={8} fill={blue} />
    <Bar label="C" size={6} fill={gray} />
  </BarPlot>
</Frame>
