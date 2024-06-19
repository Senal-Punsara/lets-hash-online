import React, { useEffect, useCallback, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { ToastContainer, toast } from "react-toastify";
import { styled } from "@mui/material/styles";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import CryptoJS from "crypto-js";
import "react-toastify/dist/ReactToastify.css";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

import ProcessingImage from "../../resources/processing.gif";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 14,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#E8E8E8",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#00245A",
  },
}));

const steps = ["Enter the Text", "Select Hashing Method", "Calculate the Hash"];

const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: "50%",
  width: 16,
  height: 16,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 0 0 1px rgb(16 22 26 / 40%)"
      : "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
  backgroundColor: theme.palette.mode === "dark" ? "#394b59" : "#f5f8fa",
  backgroundImage:
    theme.palette.mode === "dark"
      ? "linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))"
      : "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
  ".Mui-focusVisible &": {
    outline: "2px auto rgba(19,124,189,.6)",
    outlineOffset: 2,
  },
  "input:hover ~ &": {
    backgroundColor: theme.palette.mode === "dark" ? "#30404d" : "#ebf1f5",
  },
  "input:disabled ~ &": {
    boxShadow: "none",
    background:
      theme.palette.mode === "dark"
        ? "rgba(57,75,89,.5)"
        : "rgba(206,217,224,.5)",
  },
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: "#137cbd",
  backgroundImage:
    "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
  "&::before": {
    display: "block",
    width: 16,
    height: 16,
    backgroundImage: "radial-gradient(#fff,#fff 28%,transparent 32%)",
    content: '""',
  },
  "input:hover ~ &": {
    backgroundColor: "#106ba3",
  },
});

// Inspired by blueprintjs
function BpRadio(props) {
  return (
    <Radio
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      {...props}
    />
  );
}

export default function TextHashSlider() {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [text, setText] = useState("");
  const [hash, setHash] = useState("");
  const [hashFunc, setHashFunc] = useState("MD5");
  const [hashingProgress, setHashingProgress] = useState(0);
  const [processState, setProcessState] = useState(0);

  useEffect(() => {
    const unloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", unloadCallback);
    return () => window.removeEventListener("beforeunload", unloadCallback);
  }, []);

  const handleChange = (event) => {
    setProcessState(0);
    setHashingProgress(0);
    setHashFunc(event.target.value);
  };

  const isStepOptional = (step) => {
    return step === 4;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    if (activeStep === 0 && text === "") {
      toast.warning("Please Enter Some Text", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
    setText("");
  };

  // Calculate hash
  const calculateHash = () => {
    setHashingProgress(0);
    setProcessState(1);
    setTimeout(() => {
      let hash;
      if (hashFunc === "MD5") {
        hash = CryptoJS.MD5(text);
      } else if (hashFunc === "SHA256") {
        hash = CryptoJS.SHA256(text);
      } else if (hashFunc === "SHA224") {
        hash = CryptoJS.SHA224(text);
      } else if (hashFunc === "SHA512") {
        hash = CryptoJS.SHA512(text);
      } else if (hashFunc === "SHA384") {
        hash = CryptoJS.SHA384(text);
      } else if (hashFunc === "SHA3") {
        hash = CryptoJS.SHA3(text);
      }
      setHash(hash.toString());
      setProcessState(2);
    }, 1000);
  };

  function LinearProgressWithLabel(props) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "100%", mr: 1 }}>
          <BorderLinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35, ml: 1 }}>
          <Typography variant="h6" color="text.secondary">{`${Math.round(
            props.value
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }

  LinearProgressWithLabel.propTypes = {
    /**
     * The value of the progress indicator for the determinate and buffer variants.
     * Value between 0 and 100.
     */
    value: PropTypes.number.isRequired,
  };

  return (
    <Box sx={{ width: "100%" }}>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Box>
        <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
        <Box
          sx={{
            mt: 2,
            width: "100%",
            height: "40vh",
            border: "1px solid",
            borderRadius: "5px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {activeStep === 0 && (
            <Box
              className="box1"
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TextField
                sx={{
                  width: "80%",
                  height: "70%",
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: '2px dashed grey',
                      borderRadius: '5px'
                    },
                  },
                 
                }}
                id="outlined-multiline-static"
                label="Enter the Text"
                multiline
                variant="outlined"
                rows={7}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </Box>
          )}
          {activeStep === 1 && (
            <FormControl
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              {/* <Typography variant="h6" sx={{ mb: 2 }}>
                Choose Hashing Method
              </Typography> */}
              <RadioGroup
                defaultValue="MD5"
                value={hashFunc}
                name="customized-radios"
                onChange={handleChange}
              >
                <FormControlLabel
                  value={"MD5"}
                  control={<BpRadio />}
                  label="MD5"
                />
                <FormControlLabel
                  value="SHA224"
                  control={<BpRadio />}
                  label="SHA-224"
                />
                <FormControlLabel
                  value={"SHA256"}
                  control={<BpRadio />}
                  label="SHA-256"
                />

                <FormControlLabel
                  value="SHA384"
                  control={<BpRadio />}
                  label="SHA-384"
                />
                <FormControlLabel
                  value={"SHA512"}
                  control={<BpRadio />}
                  label="SHA-512"
                />
              </RadioGroup>
            </FormControl>
          )}
          {activeStep === 2 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                width: "100%",
                height: "100%",
              }}
            >
              {(processState == 0 || processState == 2) && (
                <Button variant="contained" onClick={calculateHash}>
                  Let's Hash It
                </Button>
              )}
              {processState === 1 && (
                <>
                  <div>
                    <Typography variant="h4">Calculating ...</Typography>
                  </div>

                  <img
                    src={ProcessingImage}
                    alt="Processing"
                    width="260"
                    height="100"
                  />
                </>
              )}
              {processState === 2 && (
                <Box
                  sx={{
                    display: "Flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Typography sx={{ mt: 3, mb: 1, fontSize: "20px" }}>
                    {hashFunc} Hash of the Text:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      maxWidth: "90%",
                      overflowX: "auto",
                    }}
                  >
                    {hash}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          {isStepOptional(activeStep) && (
            <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
              Skip
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
          >
            {activeStep === steps.length - 1 ? "" : "Next"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
