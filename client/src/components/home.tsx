import React, { useState, useContext } from "react";
import endpoint from "../config";
import { Link as ReachLink, RouteComponentProps } from "@reach/router";
import { StorageContext } from "./common/localStorageContext";
import { api } from "../api";
import {
  Button,
  Box,
  Heading,
  Divider,
  useColorMode,
  Textarea,
  Text,
  Input,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/core";
import SelectHttpStatusCode from "./dropdown-http";

type MockCallResponse = {
  call: string;
  json: { [x: string]: any };
  status: number;
  error: string;
};

const Home = (_: RouteComponentProps) => {
  const [httpStatus, setHttpStatus] = useState("200");
  const [apiStatus, setApiStatus] = useState(false);
  const toast = useToast();

  const [jsondata, setJsonData] = useState("");
  const { colorMode } = useColorMode();
  const [fetchJSONinput, setFetchJSON] = useState("");

  const { apiStore, mockmeSessionKey, setAPIStore } = useContext(
    StorageContext
  );

  const fetchJSON = () => {
    if (fetchJSONinput) {
      setApiStatus(true);
      const url = `${endpoint.APP_URL}/app-fetch`;
      const body = {
        fetchurl: fetchJSONinput,
      };
      api<MockCallResponse>(url, "POST", body, mockmeSessionKey).then((res) => {
        let { call, json, status, error = "" } = res;
        setApiStatus(false);
        if (error) {
          toast({
            position: "bottom-left",
            title: "Incorrect JSON format",
            description: "Please enter proper JSON",
            status: "error",
            duration: 2000,
            isClosable: true,
          });
        } else {
          setAPIStore({
            ...apiStore,
            [call]: {
              ...apiStore[call],
              httpStatus: status,
              json: JSON.stringify(json),
            },
          });
          toast({
            position: "bottom-left",
            title: `API created with alias ${call}`,
            description: (
              <ReachLink to="/manage">
                Click here to manage your calls
              </ReachLink>
            ) as any,
            status: "success",
            duration: 8000,
            isClosable: true,
          });
        }
        setFetchJSON("");
      });
    } else {
      toast({
        position: "bottom-left",
        title: "Failed to fetch URL",
        description: "Please enter proper URL",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handSubmit = () => {
    if (jsondata) {
      setApiStatus(true);
      const url = `${endpoint.APP_URL}/app-submit`;
      const body = {
        jsondata,
        httpStatus,
      };
      api(url, "POST", body, mockmeSessionKey).then((res: any) => {
        let { call, json } = res;
        setAPIStore({
          ...apiStore,
          [call]: { httpStatus, json },
        });
        setApiStatus(false);
        setJsonData("");
        toast({
          position: "bottom-left",
          title: `API created with alias ${call}`,
          description: (
            <ReachLink to="/manage">Click here to manage your calls</ReachLink>
          ) as any,
          status: "success",
          duration: 8000,
          isClosable: true,
        });
      });
    } else {
      toast({
        position: "bottom-left",
        title: "Failed to create API",
        description: "Cannot accept HTML or blank values",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Box
        p={10}
        bg={colorMode === "light" ? "blue.100" : "gray.700"}
        w="100%"
        alignContent="center"
        overflow="hidden"
      >
        <Heading mb={4} as="h1">
          <Text color={`mode.${colorMode}.text`} fontWeight="400">
            <span style={{ fontWeight: 600 }}>Mock &amp; Store</span> your own
            API call!
          </Text>
        </Heading>

        <Box mt={10}>
          {Object.keys(apiStore).length > 0 && (
            <ReachLink to="/manage">
              <Button
                aria-label="Manage My Mocks"
                size="lg"
                variantColor="pink"
              >
                Manage My Mocks
              </Button>
            </ReachLink>
          )}
          <Button
            aria-label="Find out more"
            size="lg"
            variantColor="teal"
            mt={[5, 0]}
            ml={4}
          >
            Find Out More!
          </Button>
        </Box>
      </Box>

      <Box p={[4, 10]} display={["block", "flex"]}>
        <Box
          p={10}
          bg={`mode.${colorMode}.box`}
          w="100%"
          borderWidth={colorMode === "light" ? "1px" : 0}
          rounded="lg"
          alignContent="center"
          overflow="hidden"
        >
          <Heading as="h2" mb={4} color={`mode.${colorMode}.text`}>
            Create your own JSON
          </Heading>

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <FormControl mb={4}>
              <FormLabel htmlFor="httpstatus" color={`mode.${colorMode}.text`}>
                HTTP Status:
              </FormLabel>
              <SelectHttpStatusCode setHttpStatus={setHttpStatus} />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="json" color={`mode.${colorMode}.text`}>
                JSON Response Body:
              </FormLabel>
              <Textarea
                id="json"
                onChange={(e: any) => setJsonData(e.target.value)}
                value={jsondata}
                color={`mode.${colorMode}.text`}
                placeholder='For example: {"ParentKey": {"key1": "value1"}'
              ></Textarea>
            </FormControl>
            <Button
              aria-label="Submit JSON"
              variantColor="teal"
              mt={4}
              type="button"
              onClick={() => handSubmit()}
              isLoading={apiStatus}
            >
              Submit
            </Button>
          </form>
        </Box>
        <Divider orientation="vertical" m={["20px 0px", "0px 40px"]} />
        <Box w={["100%", "90%"]}>
          <Box
            p={10}
            bg={`mode.${colorMode}.box`}
            borderWidth={colorMode === "light" ? "1px" : 0}
            rounded="lg"
            alignContent="center"
            overflow="hidden"
          >
            <Heading as="h3" mb={4} color={`mode.${colorMode}.text`}>
              Create JSON from an external endpoint
            </Heading>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <FormControl>
                <FormLabel htmlFor="fetchjson" color={`mode.${colorMode}.text`}>
                  Enter the URL:
                </FormLabel>
                <Input
                  id="fetchjson"
                  onChange={(e: any) => setFetchJSON(e.target.value)}
                  color={`mode.${colorMode}.text`}
                  value={fetchJSONinput}
                  placeholder="https://example.com/api/todo/1"
                />
              </FormControl>

              <Button
                mt={4}
                variantColor="teal"
                type="button"
                onClick={() => fetchJSON()}
                isLoading={apiStatus}
              >
                Submit
              </Button>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
