import React, { useEffect, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import UploadFileIcon from "@mui/icons-material/UploadFile";
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

const steps = ["Select the File", "Select Hashing Method", "Calculate the Hash"];

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

export default function FileHashSlider() {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [hashFunc, setHashFunc] = useState("MD5");
  const [hasingProgress, setHasingProgress] = useState(0);
  const [fileName, setFileName] = useState(null);
  const [processState, setProcessSate] = useState(0);

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
    setProcessSate(0);
    setHasingProgress(0);
    setHashFunc(event.target.value);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length) {
      setProcessSate(0);
      const file = acceptedFiles[0];
      setFile(file);
      setFileName(file.name);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const isStepOptional = (step) => {
    return step === 4;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    if (activeStep === 0 && file == null) {
      toast.warning("Please Select a File", {
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
    setFile(null);
    setFileName(null);
  };

  // calculate hash
  const calculateHash = () => {
    setHasingProgress(0);
    setProcessSate(1);
    if (file) {
      const chunkSize = 1024 * 1024 * 2; // 20 MB chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;
      let hash;
      if (hashFunc === "MD5") {
        hash = CryptoJS.algo.MD5.create();
      } else if (hashFunc === "SHA256") {
        hash = CryptoJS.algo.SHA256.create();
      } else if (hashFunc === "SHA224") {
        hash = CryptoJS.algo.SHA224.create();
      } else if (hashFunc === "SHA512") {
        hash = CryptoJS.algo.SHA512.create();
      } else if (hashFunc === "SHA384") {
        hash = CryptoJS.algo.SHA384.create();
      } else if (hashFunc === "SHA3") {
        hash = CryptoJS.algo.SHA3.create();
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        const chunkData = CryptoJS.lib.WordArray.create(event.target.result);
        hash.update(chunkData);

        currentChunk++;
        const currentProgress = (currentChunk / totalChunks) * 100;
        setHasingProgress(currentProgress);

        if (currentChunk < totalChunks) {
          console.log(1);
          processNextChunk();
        } else {
          const finalHash = hash.finalize();
          setHash(finalHash.toString());
          setProcessSate(2);
        }
      };

      const processNextChunk = () => {
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const blob = file.slice(start, end);
        reader.readAsArrayBuffer(blob);
      };

      processNextChunk();
    }
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
              <Box
                {...getRootProps()}
                sx={{
                  width: "80%",
                  height: "70%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "2px dashed",
                  borderRadius: "5px",
                  backgroundColor: isDragActive ? "#e3f2fd" : "transparent",
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
              >
                <input {...getInputProps()} />
                <UploadFileIcon sx={{ fontSize: "50px" }} />
                <Box
                  sx={{
                    mt: 2,
                    maxWidth:"95%",
                    display: "Flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  {fileName ? (
                    <Box
                      sx={{
                        mt: 2,
                        display: "Flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        maxWidth:"100%",
                      }}
                    >
                      <Typography>Selected File:</Typography>
                      <Typography sx={{ maxWidth: "100%",overflowX:"auto",mt: 1}}><strong>{fileName}</strong></Typography>
                    </Box>
                  ) : (
                   
                    <Typography>
                      Drag and Drop or Click to Select the File
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
          {activeStep === 1 && (
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
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "",
                }}
              >
                <FormControl>
                  {/* <FormLabel id="demo-customized-radios">Hashing Functions</FormLabel> */}
                  <RadioGroup
                    defaultValue={"MD5"}
                    value={hashFunc}
                    onChange={handleChange}
                    aria-labelledby="demo-customized-radios"
                    name="customized-radios"
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
              </Box>
            </Box>
          )}
          {activeStep === 2 && (
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
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "",
                  flexDirection: "column",
                }}
              >
                {(processState == 0 || processState == 2) && (
                  <Button variant="contained" onClick={calculateHash}>
                    Lets Hash It
                  </Button>
                )}

                {processState == 1 && (
                  <>
                    <div>
                      <Typography variant="h4">Calculating ...</Typography>
                    </div>

                    <img
                      src={ProcessingImage}
                      alt="Processing"
                      width="300"
                      height="100"
                    />

                    <div style={{ width: "60%", mt: 10 }}>
                      <LinearProgressWithLabel value={hasingProgress} />
                    </div>
                  </>
                )}
                {processState == 2 && (
                  <Box
                    sx={{
                      display: "Flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography sx={{ mt: 3, mb: 1,  }}>
                      {hashFunc} Hash of the File:
                    </Typography>
                    <Typography
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
