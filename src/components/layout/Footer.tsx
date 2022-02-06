import { Flex, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Flex as="footer" width="full" align="center" justify="center">
      <Text>{new Date().getFullYear()} - ETHGlobal project</Text>
    </Flex>
  );
};

export default Footer;
