// one large donut in a frame stacked on top of two smaller side-by-side framed donuts
const donut = <TextFrame emoji aspect={1}>🍩</TextFrame>
return <Frame margin>
  <VStack>
    {donut}
    <HStack>{donut}{donut}</HStack>
  </VStack>
</Frame>
