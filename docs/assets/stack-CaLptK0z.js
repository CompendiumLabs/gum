const n=`// one large donut in a frame stacked on top of two smaller side-by-side framed donuts
const Donut = () => <TextFrame emoji aspect={1}>🍩</TextFrame>
return <Frame margin>
  <VStack>
    <Donut/>
    <HStack>
      <Donut/>
      <Donut/>
    </HStack>
  </VStack>
</Frame>
`;export{n as default};
