# Unified Diff Format

Provide your diffs in unified format, which is what `git` uses. Recall that a unified format diff prepends a line with a `+` or `-` to indicate whether the line is being added or removed. Lines that are unchanged are prepended with a single space (` `). Remember that to modify a line, you must remove the original line and add the new line.

In cases where there are lines that are similar, it may be useful to provide one or two lines of context before and after the target line. When you have multiple changes that are being made nearby, err on the side of combining them into a single diff chunk. Otherwise, you can provide multiple diff chunks. Different chunks of the diff can optionally be prepended with a line that starts with `@@ ... @@`, but the line numbers are not needed as I will apply the diff based on the context provided.

**Diff Example 1: Adding Arguments**

Suppose that we have generated the graph of a sine wave and the current code state is:

```jsx
<Frame margin={0.2}>
  <Plot aspect={2} ylim={[-1.5, 1.5]} title="Sine Wave">
    <SymPath fy={sin} xlim={[0, 2*pi]} />
  </Plot>
</Frame>
```

The user has requested that changes be made according to the following query:

QUERY: Add dashed grid lines to the figure. Change the plot title to "Trig Functions".

In this case, it is appropriate to provide a diff as a response. We can simply modify the `title` argument and add two new grid related attributes:

```diff
@@ ... @@
-  <Plot aspect={2} ylim={[-1.5, 1.5]} title="Sine Wave">
+  <Plot aspect={2} ylim={[-1.5, 1.5]} title="Trig Functions" grid grid-stroke-dasharray={4}>
```

Notes: Since the `Plot` line is unique, we don't need to supply additional context. Try to match the whitespace of the original code when possible. That said, the diff match code is somewhat robust to whitespace differences, so you don't need to worry about it too much.

**Diff Example 2: Adding Elements**

Suppose that we are creating arrangements of shapes and the current code state is:

```jsx
<Frame margin padding border>
  <HStack spacing>
    <Circle />
    <Square />
    <Triangle />
  </HStack>
</Frame>
```

The user has requested changes according to the following query:

QUERY: Add a rounded square to the arrangement.

Then an appropriate diff to address this would look something like the following:

```diff
@@ ... @@
   <Triangle />
+  <Square rounded />
 </HStack>
```

Notes: Notice that we provided lines of context before and after the diff so that I can figure out where to apply the replacement without using line numbers.

**Diff Example 3: Multiple Changes**

Suppose that we are dealing with a bar plot and the current code state is:

```jsx
<Frame margin={0.3}>
  <BarPlot ylim={[0, 10]} yticks={6} xlabel="Country" ylabel="Population">
    <Bar label="X" size={2} />
    <Bar label="Y" size={8} />
    <Bar label="Z" size={4} />
  </BarPlot>
</Frame>
```

The user has then requested changes according to the following query:

QUERY: Make the bar for country Y red. Add a title of "Population by Country".

We can again make the changes using a slightly more complicated diff:

```diff
@@ ... @@
-  <BarPlot ylim={[0, 10]} yticks={6} xlabel="Country" ylabel="Population">
+  <BarPlot ylim={[0, 10]} yticks={6} xlabel="Country" ylabel="Population" title="Population by Country">
     <Bar label="X" size={2} />
-    <Bar label="Y" size={8} />
+    <Bar label="Y" size={8} fill={red} />
```

Notes: Here we have an example in which the two edits are sufficiently close together that it makes sense to combine them into a single diff.

**Diff Example 4: Multiple Chunks**

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
@@ ... @@
-      <Edge node1="A" node2="Y" dir2="n" />

@@ ... @@
-        <Bar label="A" size={2} stroke={none} fill={blue} rounded/>
+        <Bar label="A" size={1} stroke={none} fill={blue} rounded/>

@@ ... @@
-        <Bar label="Y" size={4} stroke={none} fill={blue} rounded/>
+        <Bar label="Y" size={3} stroke={none} fill={blue} rounded/>
```

Notes: Here you had to understand how the bar chart was being used to show the number of connections, meaning changes to the graph imply certain changes to the bar chart. It would have possible to combine the second and third diff blocks here, either way would have been acceptable.
