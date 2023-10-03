import {
  Box,
  Container,
  HStack,
  AbsoluteCenter,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Tabs,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useHistory } from "react-router";

import Login from "../components/Authentication/Login";

import Signup from "../components/Authentication/Signup";
import { PhoneIcon } from "@chakra-ui/icons";

function Homepage() {
  const history = useHistory();

  
  useEffect(() => {

    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) history.push("/chats");
  }, [history]);

  return (
    <>
     <HStack w={{lg:'30%', base:'0%'}}>
    </HStack>
      <HStack w={{lg:'70%', base:'100%'}}>

    <Container   maxW="xl"  >
          <Text  display={{
            md: 'none'}} fontSize="3xl"  paddingY={4} fontWeight="extrabold" textAlign="center" color="white" >Dialogue Depot AI</Text>
      <Box bg="#ffffff"
           w="100%" 
           p={4} 
           borderRadius="lg" 
           borderWidth="1px"
        >            
        <Tabs isFitted colorScheme="blue"  variant="solid-rounded">
          <TabList   mb="1em">
            <Tab >Login</Tab>
            <Tab >Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
      </HStack>


      <div className="linkTree">
        <div className="bot">
          <a  href="https://linktr.ee/hacktivspacecommunity" target="_blank">
            
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="white" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
            </a>
        </div>
      </div>
     
      </>
  );
}

export default Homepage;
