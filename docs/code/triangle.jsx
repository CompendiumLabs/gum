// make a diamond shape with two triangles, the triangle on top is red and the triangle on the bottom is blue
<Frame margin>
  <VStack>
    <Triangle fill={red} aspect={1} />
    <VFlip><Triangle fill={blue} aspect={1} /></VFlip>
  </VStack>
</Frame>
