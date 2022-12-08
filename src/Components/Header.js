import "./Header.css";
import { Box, Typography } from "@mui/material";

const Header = () => {
    return(
        <>
            <Box className="container">
                <Typography
                 className="heading-container"
                 variant="span"
                 >
                    Admin UI
                </Typography>
            </Box>
        </>
    );
}

export default Header;