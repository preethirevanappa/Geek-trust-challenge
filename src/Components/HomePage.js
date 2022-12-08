import "./HomePage.css"
import React, {useState, useEffect} from "react"
import { Box } from "@mui/material";
import { useSnackbar } from "notistack";
import axios from "axios";
import Header from "./Header";
import Table from "./Table";
import PaginationButtons from "./PaginationButtons";

function HomePage() {
  const { enqueueSnackbar } = useSnackbar();//To notify the user with messages whether the particular function is done.
  const [users, setUsers] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [editMode, setEditMode] = useState({
    editStatus: false,
    userId: null,
  });
  const [allRowsSelected, setAllRowsSelected] = useState(false);
  const [usersSelected, setUsersSelected] = useState([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [unabletoFetch, setUnabletoFetch] = useState(false);
  
  let pages = Math.ceil(users.length / 10);//To calculate the total no of pages.

  //To fetch all the users data from the backend Api.
  const fetchData = async () =>{
    let response;
    try {
      response = await axios.get(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      );
    } catch (error) {
      enqueueSnackbar(error.response.data.message, { variant: "error" });
    }
    const resJSON = response.data;
    return resJSON;
  }

  //Get users by their email
  const getUsersByNameEmailRole = (searchKey) => {
    let filteredUserList = [];
    filteredUserList = users.filter((user) => {
      return (
        user.name.toLowerCase().includes(searchKey.toLowerCase()) ||
        user.email.toLowerCase().includes(searchKey.toLowerCase()) ||
        user.role.toLowerCase().includes(searchKey.toLowerCase())
      );
    });
    pages = Math.ceil(filteredUserList.length / 10); 
    return filteredUserList;
  }

  //Handle function to check the rows
  const handleRowsCheckChange = (userId) => {
    let usersSelectedCopy = [...usersSelected];
    if (usersSelected.includes(userId)) {
      usersSelectedCopy = usersSelectedCopy.filter((val) => val !== userId);
    } else {
      usersSelectedCopy.push(userId);
    }
    setUsersSelected(usersSelectedCopy);
  }
  
  //Handle function to handle multiple rows
  const handleMultipleRowCheckChange = () => {
    let usersList = [];
    if (!allRowsSelected) {
      currentPageUserList.forEach((val) => {
        usersList.push(val.id);
      });
      console.log(usersList);
      setUsersSelected(usersList);
      setAllRowsSelected(true);
    } else {
      setUsersSelected(usersList);
      setAllRowsSelected(false);
    }
  }
  
  //Function to update users details
  const updateUserData = (e, userId) => {
    let usersCopy = JSON.parse(JSON.stringify(users));
    for (let i = 0; i < usersCopy.length; i++) {
      if (usersCopy[i].id === userId) {
        usersCopy[i][e.target.name] = e.target.value;
      }
    }
    setUsers(usersCopy);
  }
  
  //Function to delete the users data
  const deleteUsers = () => {
    let usersCopy = [...users];
    usersCopy = usersCopy.filter((val) => !usersSelected.includes(val.id));
    setUsers(usersCopy);
    setUsersSelected([]);
    setAllRowsSelected(false);
    enqueueSnackbar("Selected users data deleted successfully", { variant: "success" });
  }
  
  //To delete a single user data
  const deleteUser = (userId) => {
    let usersList = [];
    usersList = users.filter((val) => val.id !== userId);
    setUsers(usersList);
    enqueueSnackbar("Deleted user's data successfully", { variant: "success" });
  }
  
  
  function userDataValidation(userId) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === userId) {
        if (
          users[i].name === "" ||
          users[i].email === "" ||
          !validateEmail(users[i].email)
        ) {
          if(users[i].name === "")
            alert("Name cannot be empty");
          if(users[i].email === "")
            alert("Email cannot be empty");
          return false;
        }
        break;
      }
    }
    return true;
  }

  //To validate the emails
  function validateEmail(email) {
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(!email.match(mailformat))
      alert("Enter a valid email id. Ex: 'example@xmail.com'");
    return email.match(mailformat);
  }

  
  const handlePreviousPagesClick = () => {
    if (currentPageNumber > 1)
      setCurrentPageNumber(currentPageNumber - 1);
  }
  
  
  const getCurrentPageUserList = (userList) => {
    let currentPageUserList = [];
    let topUserIndex = (currentPageNumber - 1) * 10;
    let bottomUserIndex =
    topUserIndex + 9 <= userList.length - 1
    ? topUserIndex + 9
    : userList.length - 1;
    currentPageUserList = userList.slice(topUserIndex, bottomUserIndex + 1);
    
    if (currentPageUserList.length === 0 && currentPageNumber !== 1)
      handlePreviousPagesClick();
    return currentPageUserList;
  }
  
  
  const currentPageUserList = 
    searchString === "" 
      ? getCurrentPageUserList(users) 
      : getCurrentPageUserList(getUsersByNameEmailRole(searchString));
  
  const handleNextPageClick = () => {
    if (currentPageNumber < pages) {
      setCurrentPageNumber(currentPageNumber + 1);
    }
  }
  
  useEffect(() => {
    setUsersSelected([]); 
    setAllRowsSelected(false);
  }, [currentPageNumber]);

  useEffect(() => {
    fetchData()
      .then((response) => {
        setUsers(response);
        setUnabletoFetch(false);
      })
      .catch((error) => {
        setUnabletoFetch(true);
        enqueueSnackbar("Cannot fetch data at the moment", { variant: "error" });
      });
  }, []);

  //If not able to fetch the data
  if (unabletoFetch) {
    return (
      <>
        <Header />
        <div>
          <h5>
            Oops!. Cannot fetch data at the moment. Try refreshing the app or try again after some time.
          </h5>
        </div>
      </>
    );
  }

  //If data fetched and everything is working data is gets displayed
  return(
    <React.Fragment>
      <Header />
      <Box className="container-box">
            <Box className="search-bar-container">
                <input
                 type="search"
                 placeholder="Search by name, email or role"
                 value={searchString}
                 onChange={(e) => setSearchString(e.target.value)}
                />
            </Box>
        </Box>
        <Table
          users={currentPageUserList}
          usersSelected={usersSelected}
          allRowsSelected={allRowsSelected}
          handleMultipleRowCheckChange={handleMultipleRowCheckChange}
          handleEditButtonClick={(userId) =>
            setEditMode({ editStatus: true, userId })
          }
          handleSaveClick={(userId) => {
            let isUserDataValid = userDataValidation(userId);
            if (isUserDataValid) {
              setEditMode({
                editStatus: false,
                userId: null,
              });
            }
            enqueueSnackbar("User data saved successfully", { variant: "success" });
          }}
          editMode={editMode}
          validateEmail={validateEmail}
          handleDeleteButtonClick={(userId) => deleteUser(userId)}
          handleRowsCheckChange={(userId) => handleRowsCheckChange(userId)}
          handleRowValuesChange={(e, userId) => updateUserData(e, userId)}
        />
        <div className="deleteBtn-pagination-container">
          <button className="delete-selected-btn" onClick={deleteUsers}>
            Delete Selected
          </button>
          <PaginationButtons
            currPageNum={currentPageNumber}
            numberOfPages={pages}
            handleClick={(num) => setCurrentPageNumber(Number(num))}
            handlePreviousPagesClick={handlePreviousPagesClick}
            handleCurrentPageClick={() => setCurrentPageNumber(1)}
            handleLastPageClick={() => setCurrentPageNumber(pages)}
            handleNextPageClick={handleNextPageClick}
          />
        </div>
    </React.Fragment>
  );
}

export default HomePage;