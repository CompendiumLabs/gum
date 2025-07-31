// A plot with three bars with black borders at "A", "B", and "C". The first bar is red and is the shortest, the second bar is blue and is the tallest, while the third bar is green and its height is in between.
<Frame margin={0.25}>
  <BarPlot ylim={[0, 10]} yticks={6} title="Example BarPlot" xlabel="Category" ylabel="Value" xaxis-tick-pos="none">
    <Bar label="A" size={3} fill={red} rounded border-none/>
    <Bar label="B" size={8.5} fill={blue} rounded border-none />
    <Bar label="C" size={6.5} fill={green} rounded border-none />
  </BarPlot>
</Frame>
