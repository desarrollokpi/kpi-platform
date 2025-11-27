// import React, { useRef, useEffect, useState, useCallback } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import AppBar from "../layout/AppBar";
// import Loading from "./../layout/Loading";
// import LoadingButton from "@mui/lab/LoadingButton";

// import Typography from "@mui/material/Typography";
// import Box from "@mui/material/Box";
// import Grid from "@mui/material/Grid";
// import Checkbox from "@mui/material/Checkbox";
// import Stack from "@mui/material/Stack";
// import Container from "@mui/material/Container";
// import Button from "@mui/material/Button";
// import { readTermsAndConditions } from "./../../state/termsAndConditions/termsAndConditionsActions";
// import { acceptTermsAndConditions } from "./../../state/admins/adminsActions";
// import { readProfile } from "./../../state/auth/authActions";
// import { useNavigate } from "react-router-dom";

// import useTermsAndConditions from "../../hooks/useTermsAndConditions";
// import roles from "../../constants/roles";

// const TermsAndConditions = () => {
//   const dispatch = useDispatch();
//   const { termsAndConditions } = useSelector((state) => state.termsAndConditions);
//   const { loading } = useSelector((state) => state.admins);

//   const navigate = useNavigate();
//   const userAcceptedTermsAndConditions = useTermsAndConditions();

//   const termsAndConditionsBody = useRef();

//   const [isAtBottom, setIsAtBottom] = useState(false);
//   const [termsAndConditionsAccepted, setTermsAndConditionsAccepted] = useState(false);

//   useEffect(() => {
//     termsAndConditionsBody.current.addEventListener("scroll", () => setIsAtBottom(isScrolledToBottom()));
//   }, []);

//   useCallback(() => {
//     if (!userAcceptedTermsAndConditions && !loading) navigate("/admins/reports-groups");
//   }, [userAcceptedTermsAndConditions, loading, navigate]);

//   const handleCheck = () => {
//     setTermsAndConditionsAccepted(!termsAndConditionsAccepted);
//     dispatch(acceptTermsAndConditions(termsAndConditions));
//   };

//   const isScrolledToBottom = () => {
//     const { scrollTop, offsetHeight, scrollHeight } = termsAndConditionsBody.current;

//     return scrollTop + offsetHeight === scrollHeight;
//   };

//   const handleAcceptTermsAndConditions = () => {
//     dispatch(readProfile(roles.ADMIN));
//     navigate("/admins/reports-groups");
//   };

//   return (
//     <>
//       <AppBar />
//       <Container maxWidth="lg">
//         <Box mt={4} px={2}>
//           <Typography variant="h4" mb={4}>
//             Términos y condiciones
//           </Typography>
//           <Box ref={termsAndConditionsBody} my={6} sx={{ maxHeight: "60vh", overflow: "auto", marginTop: "1rem" }}>
//             {termsAndConditions ? termsAndConditions.body : <Loading />}
//           </Box>
//         </Box>

//         <Grid justifyContent="space-between" alignItems="center" container mt={3}>
//           <Grid item xs={12} md={6}>
//             <Stack alignItems="center" direction="row">
//               <Checkbox onChange={handleCheck} disabled={!termsAndConditionsAccepted && !isAtBottom} checked={termsAndConditionsAccepted} />
//               <Typography variant="body1">Entiendo y acepto los términos y condiciones</Typography>
//             </Stack>
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <Grid container direction="row-reverse" px={2}>
//               <LoadingButton disabled={!termsAndConditionsAccepted || loading} variant="contained" onClick={handleAcceptTermsAndConditions} loading={loading}>
//                 Continuar
//               </LoadingButton>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Container>
//     </>
//   );
// };

// export default TermsAndConditions;
