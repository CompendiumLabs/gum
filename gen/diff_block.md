# Block Diff Format

You may also be asked to provide diffs in the form of blocks of code to search for and replace. This is the format used in git merge conflicts to indicate where conflicts have occurred. It uses "<<<<<<<", "=======", ">>>>>>>" to demark blocks of original (SEARCH) and replacement (REPLACE) code. In a stylized sense, a single block would look like:

```diff
<<<<<< SEARCH
ORIGINAL
CODE
BLOCK
=======
NEW
CODE
BLOCK
>>>>>>> REPLACE
```

The content of each block should be "<<<<<<< SEARCH" followed by the original code block to search for, then "=======" followed by the new code block to replace it with, then end with ">>>>>>> REPLACE". Any content outside of a search/replace block will be ignored.

As with the unified diff format, when lines are similar, you may need to provide one or two lines of context before and after the desired change so that I can figure out where to apply the replacement without using line numbers. There is no need to specify a filename, but you should wrap the code in a ```diff``` block. In the case where the changes are too large, it makes sense to simply provide entirely new code and wrap it in a ```javascript``` block.

Using the same examples as above we would return:

**Block Example 1: Adding Arguments**

Suppose that we have generated the graph of a sine wave and the current code state is:

```javascript
<Frame margin={0.2}>
  <Plot aspect={2} ylim={[-1.5, 1.5]} title="Sine Wave">
    <SymPath fy={sin} xlim={[0, 2*pi]} />
  </Plot>
</Frame>
```

QUERY: Add dashed grid lines to the figure. Change the plot title to "Trig Functions".

```diff
<<<<<<< SEARCH
  <Plot aspect={2} ylim={[-1.5, 1.5]} title="Sine Wave">
=======
  <Plot aspect={2} ylim={[-1.5, 1.5]} title="Trig Functions" grid grid-stroke-dasharray={4}>
>>>>>>> REPLACE
```

Notes: Here we can again just replace the entire `Plot` constructor with the new one. Try to match the whitespace of the original code when possible. That said, the diff match code is somewhat robust to whitespace differences, so you don't need to worry about it too much.

**Block Example 2: Adding Elements**

Suppose that we are creating arrangements of shapes and the current code state is:

```javascript
<Frame margin={0.2}>
  <HStack spacing>
    <Circle />
    <Square />
    <Triangle />
  </HStack>
</Frame>
```

QUERY: Add a rounded square to this arrangement.

```diff
<<<<<<< SEARCH
    <Triangle />
  </HStack>
=======
    <Triangle />
    <Square rounded />
  </HStack>
>>>>>>> REPLACE
```

Notes: Here we provide context before and after the diff so that I can figure out where to apply the replacement without using line numbers.

**Block Example 3: Multiple Changes**

Suppose that we are dealing with a bar plot and the current code state is:

```javascript
<Frame margin={0.3}>
  <BarPlot ylim={[0, 10]} yticks={6} xlabel="Country" ylabel="Population">
    <Bar label="X" size={2} />
    <Bar label="Y" size={8} />
    <Bar label="Z" size={4} />
  </BarPlot>
</Frame>
```

QUERY: Make the bar for country Y red. Add a title of "Population by Country".

```diff
<<<<<<< SEARCH
  <BarPlot ylim={[0, 10]} yticks={6} xlabel="Country" ylabel="Population">
    <Bar label="X" size={2} />
    <Bar label="Y" size={8} />
=======
  <BarPlot ylim={[0, 10]} yticks={6} xlabel="Country" ylabel="Population" title="Population by Country">
    <Bar label="X" size={2} />
    <Bar label="Y" size={8} fill={red} />
>>>>>>> REPLACE
```

Notes: Here it would have been possible to use two separate diff blocks, but it makes more sense to combine them into a single diff block since they are close together.

**Block Example 4: Multiple Chunks**

Suppose that we are creating a network digram with an embedded bar chart and the current code state is:

```jsx
<Frame border margin rounded>
  <Group>
    <Network xlim={[0, 2]}>
      <Node label="A" rad={0.075} pos={[0.4, 0.25]} aspect fill>A</Node>
      <Node label="B" rad={0.075} pos={[0.4, 0.50]} aspect fill>B</Node>
      <Node label="C" rad={0.075} pos={[0.4, 0.75]} aspect fill>C</Node>
      <Node label="Y" rad={0.075} pos={[1.0, 0.50]} aspect fill>Y</Node>
      <Node label="Z" rad={0.075} pos={[1.6, 0.65]} aspect fill>Z</Node>
      <Edge node1="A" node2="Y" dir2="n" />
      <Edge node1="A" node2="B" dir1="w" dir2="w" />
      <Edge node1="B" node2="Y" />
      <Edge node1="C" node2="Y" dir2="s" />
      <Edge node1="Y" node2="Z" />
    </Network>
    <TitleFrame title="Connections" pos={[0.8, 0.225]} rad={[0.15, 0.15]} title-size={0.1}>
      <BarPlot yticks={6} ylim={[0, 5]} xaxis-tick-pos="inner" xaxis-tick-label-size={2.5} yaxis-tick-label-size={2.5}>
        <Bar label="A" size={2} stroke={none} fill={blue} rounded/>
        <Bar label="B" size={2} stroke={none} fill={blue} rounded/>
        <Bar label="C" size={1} stroke={none} fill={blue} rounded/>
        <Bar label="Y" size={4} stroke={none} fill={blue} rounded/>
        <Bar label="Z" size={1} stroke={none} fill={blue} rounded/>
      </BarPlot>
    </TitleFrame>
  </Group>
</Frame>
```

The user has requested changes according to the following query:

QUERY: Remove the edge connecting nodes A and Y and update the bar chart showing the number of connections.

```diff
<<<<<<< SEARCH
      <Edge node1="A" node2="Y" dir2="n" />
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
        <Bar label="A" size={2} stroke={none} fill={blue} rounded/>
=======
        <Bar label="A" size={1} stroke={none} fill={blue} rounded/>
>>>>>>> REPLACE

<<<<<<< SEARCH
        <Bar label="Y" size={4} stroke={none} fill={blue} rounded/>
=======
        <Bar label="Y" size={3} stroke={none} fill={blue} rounded/>
>>>>>>> REPLACE
```

Notes: Here you had to understand how the bar chart was being used to show the number of connections, meaning changes to the graph imply certain changes to the bar chart. It would have possible to combine the second and third diff blocks here, either way would have been acceptable.
