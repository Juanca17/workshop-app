import React, { FunctionComponent, useState, useEffect, useCallback } from "react";
import "./App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import car_placeholder from './car_placeholder.png'
import moment from 'moment'
const API_URL = process.env.REACT_APP_API_URL

type CarProps = {
    _id: string,
    id: number;
    description?: string;
    make: string;
    model: string;
    km?: number;
    image?: string;
    estimatedate?: string;
    person?: string;
};
type CardProps = {
  car: CarProps;
};

type DataProps = {
  vehicles: Array<CarProps>,
  isFulfilled: boolean
};

const Card: FunctionComponent<CardProps> = ({ car }) => {
  return (
    <div className="vehicle_card card mx-2 mb-5">
      {car.estimatedate ? (
        <div className="ribbon">
          <span>Estimated date: {car.estimatedate}</span>
        </div>
      ) : null}
      <div className="card-header">{car.id}</div>
      <div className="vehicle_image">
        <img
          className="card-img-top"
          src={car.image ?  car.image : car_placeholder}
          alt="car"
        />
        {car.estimatedate ? <div className="image_overlay" /> : null}
      </div>

      <ul className="list-group list-group-flush">
        <li className="vehicle_model list-group-item">
          <b>
            {car.make} {car.model}
          </b>{" "}
          <br />{" "}
          <span className="vehicle_kms">{car?.km?.toLocaleString()} kms</span>
        </li>
        <li className="vehicle_description list-group-item">
          {car.description}
        </li>
      </ul>
    </div>
  );
};

function App() {
  const [data, setData] = useState<DataProps>({ vehicles: [], isFulfilled: false })
  const [selected, setSelected] = useState<CardProps | null>(null);
  const [person, setPerson] = useState<string>('')
  const [estimatedate, setEstimatedate] = useState<any>(new Date());
  const fetchVehicles = async() => {
    try {
      const url = `${API_URL}/vehicles`
      const response = await axios.get(url)
      const vehicles = response.data
      setData({ vehicles, isFulfilled: true });
    } catch (error) {
      setData({ vehicles: [], isFulfilled: true });
    }
  }
  useEffect(() => { fetchVehicles() }, [])

  const handleSelectCar = useCallback((car: CarProps) => {
    setSelected({ car })
    setEstimatedate(moment(car.estimatedate, 'YYYY/DD/MM').toDate())
    setPerson(car.person || '')
  }, [])
  const handleSubmit = useCallback(async() => {
    const body = {
      person,
      estimatedate: moment(estimatedate).format('YYYY/DD/MM')
    }
    try {
      const url = `${API_URL}/vehicles/${selected?.car._id}`
      await axios.patch(url, body)
      await fetchVehicles();
    } catch (error) {
      console.error(error)
    }
  }, [estimatedate, person, selected?.car._id])

  return (
    <div className="App">
      <div className="container">
        <div className="row mt-5 justify-content-center">
          {data.vehicles.map((car, index) => {
            return (
              <div
                key={index}
                className="col-xl-3 col-lg-6"
                data-toggle="modal"
                data-target="#exampleModal"
                onClick={() => handleSelectCar(car)}
              >
                <Card car={car} />
              </div>
            );
          })}
        </div>
        <div
          className="modal fade"
          id="exampleModal"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Mark {selected?.car.id} as mantained
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group row">
                    <label className="col-sm-4 col-form-label">Person</label>
                    <div className="col-sm-8">
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Person"
                        value={person}
                        onChange={e => setPerson(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group row">
                    <label className="col-sm-4 col-form-label">
                      Estimated date
                    </label>
                    <div className="col-sm-8">
                      <DatePicker
                        className="custom_datepicker"
                        selected={estimatedate}
                        onChange={date => setEstimatedate(date)}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  data-dismiss="modal"
                  onClick={handleSubmit}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
