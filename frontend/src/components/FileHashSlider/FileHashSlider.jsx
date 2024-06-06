import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
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

import ProcessingImage from "../../resources/processing2.gif";

const steps = ["Select the File", "Select Hashing Method", "Let's Calculate"];

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
  const [hashFunc, setHashFunc] = useState(0);
  const [hasingProgress, setHasingProgress] = useState(0);
  const [fileName, setFileName] = useState(null);

  const handleChange = (event) => {
    setHashFunc(event.target.value);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length) {
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
    if (file) {
      const chunkSize = 1024 * 1024 * 20; // 20 MB chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;
      let hash = CryptoJS.algo.MD5.create();

      const reader = new FileReader();

      reader.onload = (event) => {
        const chunkData = CryptoJS.lib.WordArray.create(event.target.result);
        hash.update(chunkData);

        currentChunk++;
        const currentProgress = (currentChunk / totalChunks) * 100;
        setHasingProgress(currentProgress);

        if (currentChunk < totalChunks) {
          processNextChunk();
        } else {
          const finalHash = hash.finalize();
          setHash(finalHash.toString());
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
            height: "50vh",
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
                  width: "70%",
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
                <Typography sx={{ mt: 2 }}>
                  {fileName
                    ? `Selected File: ${fileName}`
                    : "Drag and drop or Click to Select the File"}
                </Typography>
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
                    defaultValue={0}
                    value={hashFunc}
                    onChange={handleChange}
                    aria-labelledby="demo-customized-radios"
                    name="customized-radios"
                  >
                    <FormControlLabel
                      value={0}
                      control={<BpRadio />}
                      label="MD5"
                    />
                    <FormControlLabel
                      value={1}
                      control={<BpRadio />}
                      label="SHA1"
                    />
                    <FormControlLabel
                      value={2}
                      control={<BpRadio />}
                      label="SHA3"
                    />
                    <FormControlLabel
                      value={3}
                      control={<BpRadio />}
                      label="SHA256"
                    />
                    <FormControlLabel
                      value={4}
                      control={<BpRadio />}
                      label="SHA512"
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
                <img src={ProcessingImage} alt="Processing" width="200" height="200" />
                <Button variant="contained" onClick={calculateHash}>
                  Lets Hash It
                </Button>
                <p>{hasingProgress} %</p>
                <p>{hash}</p>
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