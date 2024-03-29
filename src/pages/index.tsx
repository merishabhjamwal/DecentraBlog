/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  IconButton,
  Button,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormLabel,
  FormControl,
  Input,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FiPlusCircle } from "react-icons/fi";
import { useMoralis } from "react-moralis";
import { Contract } from "web3-eth-contract";

import contractABI from "../abi.json";

const address =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0xAa831894a9056263FeCBD3395CC9A413c41C043d";

type UserProfile = {
  username: string;
  bio: string;
};

type Post = {
  author: string;
  content: string;
  created: string;
  title: string;
};

type IFormInput = {
  title: string;
  content: string;
};

const Home = () => {
  const [contract, setContract] = useState<Contract>();
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [latestPosts, setLatestPosts] = useState<Array<Post>>();
  const { authenticate, isAuthenticated, user, logout, Moralis } = useMoralis();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<IFormInput>();

  const GRAY = useColorModeValue("gray.100", "gray.700");

  const userAddress = isAuthenticated ? user?.get("ethAddress") : "";

  async function initContract() {
    console.log("initContract");
    const web3 = await Moralis.Web3.enable();
    const theContract = new web3.eth.Contract(contractABI, address);
    setContract(theContract);
  }

  async function getUserProfile() {
    if (contract !== undefined) {
      const profileData = await contract.methods.users(userAddress).call();
      setUserProfile({
        bio: profileData.bio,
        username: profileData.username,
      });
    }
  }

  async function getPosts() {
    if (contract !== undefined) {
      const latestPostId = await contract.methods.latestPostId().call();
      // We only want the last 10 posts
      const last = latestPostId < 10 ? 0 : 10;
      const posts: Array<Post> = [];
      // eslint-disable-next-line no-plusplus
      for (let index = latestPostId; index > last; index--) {
        // eslint-disable-next-line no-await-in-loop
        const post = await contract.methods.posts(index).call();
        posts.push({
          author: post.author,
          content: post.content,
          created: post.created,
          title: post.title,
        });
      }
      setLatestPosts(posts);
    }
  }

  useEffect(() => {
    initContract();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getUserProfile();
      getPosts();
    }
  }, [contract, isAuthenticated]);

  const NewPostForm = () => {
    const onSubmit: SubmitHandler<IFormInput> = ({
      title,
      content,
    }: IFormInput) => {
      contract?.methods
        .createPost(title, content)
        .send({ from: userAddress })
        .then((receipt: unknown) => {
          console.log(receipt);
        });
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl>
          <FormLabel htmlFor="title">Title</FormLabel>
          <Input id="title" placeholder="title" {...register("title")} />
          <FormLabel htmlFor="content">Content</FormLabel>
          <Input id="content" placeholder="content" {...register("content")} />
        </FormControl>
        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
        >
          Submit
        </Button>
      </form>
    );
  };
  const Header = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <>
        <HStack w="100%" justify="space-between">
          <Heading>DecentraBlog</Heading>
          <IconButton
            onClick={onOpen}
            aria-label="Add post"
            icon={<FiPlusCircle size="25" />}
          />
        </HStack>
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create Post</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <NewPostForm />
            </ModalBody>
            <ModalFooter>
              <></>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };

  // 4 Modified Card to show the post data
  const Card = ({ title, author, content }: Post) => (
    <VStack
      rounded="8"
      w="100%"
      h="100%"
      p="4"
      mt="2"
      overflow="hidden"
      borderWidth="2px"
      borderColor={GRAY}
      transition="all 0.25s"
      shadow="sm"
      transition-timing-function="spring(1 100 10 10)"
      _hover={{ transform: "translateY(-2px)", shadow: "md" }}
    >
      <HStack w="100%" justify="start">
        <Heading size="sm">{title}</Heading>
        <Text fontSize="sm">by: {author}</Text>
      </HStack>
      <Text w="100%" isTruncated>
        {content}
      </Text>
    </VStack>
  );

  const ProfileCard = () => (
    <VStack
      rounded="8"
      w="100%"
      h="100%"
      p="4"
      mt="2"
      overflow="hidden"
      borderWidth="2px"
      borderColor={GRAY}
      transition="all 0.25s"
      shadow="sm"
      transition-timing-function="spring(1 100 10 10)"
      _hover={{ transform: "translateY(-2px)", shadow: "md" }}
    >
      <HStack w="100%" justify="start">
        <Heading size="sm">Username: </Heading>
        <Text fontSize="sm">{userProfile?.username}</Text>
      </HStack>
      <Text w="100%" isTruncated>
        Bio: {userProfile?.bio}
      </Text>
    </VStack>
  );

  const LoginBar = () => (
    <HStack
      rounded="8"
      background={GRAY}
      w="100%"
      p="4"
      my="4"
      justify="space-between"
    >
      <Box>
        <Heading size="sm">User ID: {user?.get("username")}</Heading>
        <Text>Address: {userAddress}</Text>
      </Box>
      <Button onClick={() => logout()}>Logout</Button>
    </HStack>
  );
  return (
    <Box mb={8} w="full">
      {!isAuthenticated ? (
        <Button onClick={() => authenticate()}>Authenticate</Button>
      ) : (
        <>
          <LoginBar />
          <Header />
          <Divider my="4" />
          <Heading size="md">Your Profile</Heading>
          <ProfileCard />
          <Heading pt="4" size="md">
            Posts
          </Heading>
          {latestPosts !== undefined
            ? latestPosts?.map((post) => <Card {...post} />)
            : null}
        </>
      )}
    </Box>
  );
};

export default Home;
