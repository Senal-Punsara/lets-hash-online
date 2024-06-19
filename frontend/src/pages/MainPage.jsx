import React, { useEffect, useCallback, useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import FileHashSlider from "../components/FileHashSlider/FileHashSlider";
import TextHashSlider from "../components/TextHashSlider/TextHashSlider";
import Logo from "../resources/logo.png";
import { CssBaseline } from "@mui/material";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function MainPage() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{pb:4}}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pt: 4,
            pb: 3,
            bgcolor: "#B6D0E2",
          }}
        >
          <img src={Logo} alt="Processing" width="60" height="60" />
          <Typography variant="h4" sx={{ fontWeight: "bold", ml:2 }}>
            LET'S&nbsp; HASH &nbsp;ONLINE
          </Typography>
        </Box>

       

        <Box sx={{ width: "100%", bgcolor: "white", borderRadius: "5px" }}>
          <Box sx={{ p: 1 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab label="Let's Hash File" {...a11yProps(0)} />
                <Tab label="Let's Hash Text" {...a11yProps(1)} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <FileHashSlider />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <TextHashSlider />
            </CustomTabPanel>
          </Box>
        </Box>

        <Box  sx={{ width: "100%", height: "100%", bgcolor: "white", borderRadius: "5px", mt:4 , p:2 }}>
          <Typography ><strong>LET'S HASH ONLINE</strong>, your one-stop solution for calculating file and text hashes 
            quickly and easily. Whether you need to verify file integrity or text integrity,
             this user-friendly website provides accurate and reliable hash 
             calculations for all your needs.</Typography>
        </Box>

        <Box  sx={{ width: "100%", height: "100%", bgcolor: "white", borderRadius: "5px", mt:4 , p:2 }}>
          <Typography ><strong>YOUR PRIVACY MATTERS !!</strong> All hash calculations are performed locally on your device.
           This means your data never leaves your system, ensuring maximum privacy and security. You Can check the source code of the project by click  
           &nbsp;<a href="https://github.com/Senal-Punsara/lets-hash-online" target="_blank">here</a>.</Typography>
        </Box>
        
      </Container>
    </>
  );
}
