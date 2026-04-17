import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import {
  brand,
  filledActionButtonSx,
  outlinedActionButtonSx,
  textFieldStyles,
} from "./machineMaintenanceUi.jsx";

const createInitialState = (fields = []) =>
  fields.reduce((accumulator, field) => {
    if (field.type === "file") {
      accumulator[field.name] = null;
    } else if (field.defaultValue !== undefined) {
      accumulator[field.name] = field.defaultValue;
    } else {
      accumulator[field.name] = "";
    }
    return accumulator;
  }, {});

const getOptionValue = (option) =>
  typeof option === "string" ? option : option.value;

const getOptionLabel = (option) =>
  typeof option === "string" ? option : option.label;

const hasFileFieldValue = (values, fields) =>
  fields.some((field) => field.type === "file" && values[field.name]);

const normalizePayload = (values) => {
  const payload = { ...values };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === "") payload[key] = null;
  });

  return payload;
};

const buildFormData = (payload, fields) => {
  const formData = new FormData();

  fields.forEach((field) => {
    const value = payload[field.name];

    if (field.type === "file") {
      if (value) formData.append(field.name, value);
      return;
    }

    if (value !== null && value !== undefined) {
      formData.append(field.name, value);
    }
  });

  return formData;
};

const mergeInitialValues = (initialState, incomingValues, fields) => {
  if (!incomingValues) return initialState;

  const nextState = { ...initialState };

  fields.forEach((field) => {
    if (field.type === "file") {
      nextState[field.name] = null;
      return;
    }

    nextState[field.name] =
      incomingValues[field.name] ?? initialState[field.name];
  });

  return nextState;
};

const MachineMaintenanceFormView = ({
  title,
  primaryActionLabel = "Save",
  secondaryActionLabel = "Reset",
  fields = [],
  apiEndpoint,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  requestMethod = "POST",
  submitHandler,
  onSuccess,
  onError,
  successMessage = "Saved successfully.",
  initialValues = null,
  loadingInitialValues = false,
}) => {
  const initialState = useMemo(() => createInitialState(fields), [fields]);
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState({
    loading: false,
    success: "",
    error: "",
  });

  useEffect(() => {
    setFormData(mergeInitialValues(initialState, initialValues, fields));
    setErrors({});
    setSubmitState({ loading: false, success: "", error: "" });
  }, [fields, initialState, initialValues]);

  const validateForm = () => {
    const nextErrors = {};

    fields.forEach((field) => {
      const value = formData[field.name];

      if (field.required) {
        const isEmptyFile = field.type === "file" && !value;
        const isEmptyText =
          field.type !== "file" &&
          (value === "" || value === null || value === undefined);

        if (isEmptyFile || isEmptyText) {
          nextErrors[field.name] = `${field.label} is required`;
        }
      }
    });

    if (
      formData.contractValidityFrom &&
      formData.contractValidityTo &&
      new Date(formData.contractValidityTo) <
        new Date(formData.contractValidityFrom)
    ) {
      nextErrors.contractValidityTo =
        "Contract Valid To cannot be before Contract Valid From";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      nextErrors.endDate = "End Date cannot be before Start Date";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const { name, type } = field;

    if (type === "file") {
      const file = event.target.files?.[0] || null;
      setFormData((prev) => ({ ...prev, [name]: file }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: event.target.value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleReset = () => {
    setFormData(mergeInitialValues(initialState, initialValues, fields));
    setErrors({});
    setSubmitState({ loading: false, success: "", error: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = normalizePayload(formData);
    setSubmitState({ loading: true, success: "", error: "" });

    try {
      if (submitHandler) {
        const result = await submitHandler(payload);
        setSubmitState({
          loading: false,
          success: successMessage,
          error: "",
        });
        onSuccess?.(result || payload);
        return;
      }

      if (!apiEndpoint) {
        setSubmitState({
          loading: false,
          success: "",
          error: "API endpoint is missing for this form.",
        });
        return;
      }

      const requestHasFile = hasFileFieldValue(formData, fields);

      const response = await fetch(`${apiBaseUrl}${apiEndpoint}`, {
        method: requestMethod,
        credentials: "include",
        headers: requestHasFile
          ? undefined
          : {
              "Content-Type": "application/json",
            },
        body: requestHasFile
          ? buildFormData(payload, fields)
          : JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData?.message || "Unable to save form data right now.",
        );
      }

      setSubmitState({
        loading: false,
        success: successMessage,
        error: "",
      });

      onSuccess?.(responseData?.data || responseData || payload);
    } catch (error) {
      setSubmitState({
        loading: false,
        success: "",
        error: error.message || "Something went wrong while saving.",
      });
      onError?.(error);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${brand.border}`,
          borderRadius: 3,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1.5, sm: 2 },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Stack spacing={2.25}>
              {loadingInitialValues ? (
                <Alert severity="info">Loading existing record...</Alert>
              ) : null}

              {submitState.success ? (
                <Alert severity="success">{submitState.success}</Alert>
              ) : null}

              {submitState.error ? (
                <Alert severity="error">{submitState.error}</Alert>
              ) : null}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                {fields.map((field) => {
                  const commonProps = {
                    name: field.name,
                    label: field.label,
                    value:
                      field.type === "file"
                        ? undefined
                        : formData[field.name] ?? "",
                    onChange: handleChange(field),
                    placeholder: field.placeholder || "",
                    fullWidth: true,
                    required: !!field.required,
                    error: !!errors[field.name],
                    helperText:
                      errors[field.name] ||
                      (field.type === "file" && formData[field.name]
                        ? formData[field.name]?.name
                        : " "),
                    sx: textFieldStyles,
                    disabled: submitState.loading || loadingInitialValues,
                  };

                  if (field.type === "file") {
                    return (
                      <TextField
                        key={field.name}
                        {...commonProps}
                        type="file"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ accept: field.accept || "*" }}
                      />
                    );
                  }

                  if (field.select) {
                    return (
                      <TextField key={field.name} {...commonProps} select>
                        {field.options?.map((option) => (
                          <MenuItem
                            key={getOptionValue(option)}
                            value={getOptionValue(option)}
                          >
                            {getOptionLabel(option)}
                          </MenuItem>
                        ))}
                      </TextField>
                    );
                  }

                  return (
                    <TextField
                      key={field.name}
                      {...commonProps}
                      type={field.type || "text"}
                      multiline={field.multiline}
                      minRows={field.multiline ? field.minRows || 3 : undefined}
                      InputLabelProps={
                        field.type === "date" || field.type === "datetime-local"
                          ? { shrink: true }
                          : undefined
                      }
                    />
                  );
                })}
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              px: { xs: 1.5, sm: 2 },
              py: 1.5,
              backgroundColor: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              flexWrap="wrap"
              useFlexGap
              sx={{
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  submitState.loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveRoundedIcon />
                  )
                }
                disabled={submitState.loading || loadingInitialValues}
                sx={filledActionButtonSx}
              >
                {submitState.loading ? "Saving..." : primaryActionLabel}
              </Button>

              <Button
                type="button"
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={handleReset}
                disabled={submitState.loading || loadingInitialValues}
                sx={outlinedActionButtonSx}
              >
                {secondaryActionLabel}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MachineMaintenanceFormView;