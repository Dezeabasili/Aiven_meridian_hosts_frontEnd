import './updateRoom.css'
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useAxiosInterceptors from "../../hooks/useAxiosWithInterceptors";
import { useAuthContext } from "../../context/authContext";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { baseURL } from '../../context/authContext';
import {RotatingLines} from 'react-loader-spinner'

const GetRoom = () => {

  const runOnce = useRef(false);
  const [loading, setLoading] = useState(true);
  const [roomToDisplay, setRoomToDisplay] = useState();
  const [photo, setPhoto] = useState({slide: null, length: null})
  const { room_id } = useParams(); 
  const axiosWithInterceptors = useAxiosInterceptors();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuthContext();

  useEffect(() => {
    if (runOnce.current === false) {
      const displayRoom = async () => {
        setLoading(true);
        let roomStyle;
        try {
          if (location.state) {
            setRoomToDisplay(location.state);
            roomStyle = location.state

          } else {
            const resp = await axiosWithInterceptors.get(baseURL + `api/v1/rooms/${room_id}`);
            setRoomToDisplay({ ...resp.data.data });
            roomStyle = resp.data.data
          }

          setPhoto(prev => {
            prev.slide = 0
            prev.length = roomStyle.photos.length
            return {...prev}
          })
          
          setLoading(false);
        } catch (err) {
          if (err.response.data.message) {
            navigate('/handleerror', {state: {message: err.response.data.message, path: location.pathname}})
          } else {
            navigate('/somethingwentwrong')
          }
        }
      };
      displayRoom();
    }

    return () => {
      runOnce.current = true;
    };
  }, []);

  const deleteThisRoom = async () => {
    try {
      await axiosWithInterceptors.delete(baseURL + `api/v1/rooms/${room_id}`);
      navigate("/rooms");
    } catch (err) {
      if (err.response.data.message) {
        navigate('/handleerror', {state: {message: err.response.data.message, path: location.pathname}})
      } else {
        navigate('/somethingwentwrong')
      }
    }
  };

  const updateThisRoom = () => {
    navigate("/rooms/updateroom", { state: roomToDisplay.id_roomStyleDescription });
  };

  const updateRoomPhoto = () => {
   

    // Specify the types of files, the size limit in MB, and whether its a single or multiple files
    const fileOptions = {
      types: [".jpg"],
      sizeLimit: 5,
      number: "multiple",
      code: "roomphoto",
      id: room_id,
    };
    navigate("/uploadfiles", { state: fileOptions });
  };

  const changeSlide = (direction) => {
    if (direction === "right") {
      if (photo.slide === photo.length - 1) {
        setPhoto({...photo, slide: 0})
      } else {
        setPhoto({...photo, slide: photo.slide + 1}) 
      }
    } else {
      if (photo.slide === 0) {
        setPhoto({...photo, slide: photo.length - 1}) 
      } else {
        setPhoto({...photo, slide: photo.slide - 1}) 
      }
    }

  };


  return (
    <div>
      {loading ? (
       <RotatingLines
       visible={true}
       height="96"
       width="96"
       color="grey"
       strokeWidth="5"
       animationDuration="0.75"
       ariaLabel="rotating-lines-loading"
       wrapperStyle={{}}
       wrapperClass=""
       />
      ) : (
        <>
          <div className="getHotelImgContainer">
            <img
              src={
                roomToDisplay.photos[photo.slide]
              }
              alt=""
              className='getHotelImg'
              width="200"
              height="220"
            />
            {roomToDisplay.photos.length && (
              <>
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className="arrow"
                  onClick={() => changeSlide("left")}
                />
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="arrow"
                  onClick={() => changeSlide("right")}
                />
              </>
            )}
          </div>
          <p>Room reference: {roomToDisplay.id_roomStyleDescription}</p>
          <p>Hotel name: <span style={{"textTransform": "capitalize"}}><strong>{roomToDisplay.hotel.name}</strong></span></p>
          <p>Room title: <span style={{"textTransform": "capitalize"}}>{roomToDisplay.title}</span></p>
          <p>Room price: ${roomToDisplay.price}</p>
          <p>Room description: {roomToDisplay.description}</p>
          <p>Maximum number of occupants: {roomToDisplay.maxPeople}</p>

          {roomToDisplay.roomNumbers?.map((roomNumber, i) => (
            <div key={i}>
              <br />
              <p>Room number: {roomNumber.number}</p>
            </div>
          ))}

          <br />

          {auth.assignedRoles == 2030 && (
            <>
              {/* <hr /> */}
              <button
                onClick={() => {
                  updateThisRoom();
                }}
                style={{ padding: "5px" }}
              >
                Update room information
              </button>
              <br />
              <button
                onClick={() => {
                  updateRoomPhoto();
                }}
                style={{ marginTop: "5px" }}
              >
                Update room photo
              </button>
              <br />
              <button
                onClick={() => {
                  deleteThisRoom();
                }}
                style={{ marginTop: "5px" }}
              >
                Delete room
              </button>
              <br />


              {roomToDisplay.roomNumbers?.map((roomNumber) => (
                <div key={roomNumber._id}>
                  <br />
                  <h5>Room number: {roomNumber.number}</h5>

                  <p>Unavailable dates:</p>
                  {roomNumber.unavailableDates?.map(
                    (unavailableDate, index) => (
                      <div key={index}>
                        <p>
                          {unavailableDate}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ))}
            

              
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GetRoom;
