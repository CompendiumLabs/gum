// one large donut in a frame stacked on top of two smaller side-by-side framed donuts (🍩)
const donut = <TextFrame aspect={1}>D</TextFrame>
return <Frame margin>
  <VStack>
    {donut}
    <HStack>{donut}{donut}</HStack>
  </VStack>
</Frame>
