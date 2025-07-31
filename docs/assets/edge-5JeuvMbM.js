const e=`// A curved line going from the upper left to the lower right. The left side of the line has a red arrow facing left and the right side has a blue arrow facing right. Both arrows are triangular with black borders.
<Network>
  <Node label="hello" pos={[0.2, 0.2]} fill>Hello</Node>
  <Node label="world" pos={[0.8, 0.8]} fill>World!</Node>
  <Edge node1={"hello"} node2={"world"} arrow arrow-base arrow-beg-fill={red} arrow-end-fill={blue} />
</Network>
`;export{e as default};
