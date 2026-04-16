// import { Box } from "@mui/material";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "../../store/AuthContext.jsx";
// import SideBar from "../../pages/SideBar.jsx";

// const brand = {
//   pageBg: "#FFFFFF",
// };

// const ModuleLayout = ({ sidebarItems = [], children }) => {
//   const { canViewTeam } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         background: brand.pageBg,
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           minHeight: "100vh",
//           flexDirection: { xs: "column", md: "row" },
//         }}
//       >
//         <SideBar
//           canViewTeam={canViewTeam}
//           location={location}
//           navigate={navigate}
//           sidebarItems={sidebarItems}
//         />

//         <Box
//           sx={{
//             flex: 1,
//             minWidth: 0,
//             px: { xs: 2, md: 3 },
//             py: { xs: 2, md: 3 },
//             backgroundColor: "#FFFFFF",
//           }}
//         >
//           {children}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default ModuleLayout;

import { Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext.jsx";
import SideBar from "../../pages/SideBar.jsx";

const brand = {
  pageBg: "#FFFFFF",
};

const ModuleLayout = ({ sidebarItems = [], children }) => {
  const { canViewTeam } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: brand.pageBg,
      }}
    >
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <SideBar
          canViewTeam={canViewTeam}
          location={location}
          navigate={navigate}
          sidebarItems={sidebarItems}
        />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            backgroundColor: "#FFFFFF",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default ModuleLayout;
