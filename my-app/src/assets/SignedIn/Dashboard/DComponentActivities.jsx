import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './Dashboard.css';

function DComponentActivities() {
    const [activities, setActivities] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const location = useLocation();

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleAddClick = () => {
        setShowInput(true);
        setInputValue('');
        setEditIndex(null);
    };

    const handleEditClick = (index) => {
        setShowInput(true);
        setInputValue(activities[index]);
        setEditIndex(index);
    };

    const handleDeleteClick = (index) => {
      const confirmation = window.confirm('Are you sure you want to delete this activity?');
      if (confirmation) {
          const activityName = window.prompt('Please enter the name of the activity to confirm deletion:');
          if (activityName === activities[index]) {
              const newActivities = [...activities];
              newActivities.splice(index, 1);
              setActivities(newActivities);
          } else {
              window.alert('The name you entered does not match the name of the activity. The activity was not deleted.');
          }
      }
  };

  const handleInputSubmit = (event) => {
    event.preventDefault();
    if (!/^[a-zA-Z0-9- ]*$/.test(inputValue)) {
        window.alert('Invalid Club Name, please use letters, numbers, dashes or spaces');
        return;
    }
    if (editIndex !== null) {
        const newActivities = [...activities];
        newActivities[editIndex] = inputValue;
        setActivities(newActivities);
    } else {
        setActivities([...activities, inputValue]);
    }
    setShowInput(false);
  };

  return (
    <div className="activities-container">
        {activities.map((activity, index) => (
            <div key={index} className="activity-item">
                <Link to={`${location.pathname}/${activity.replace(/\s/g, '-')}`} className="activity-link">{activity}</Link>
                <button onClick={() => handleEditClick(index)} className="edit-button">Edit</button>
                <button onClick={() => handleDeleteClick(index)} className="delete-button">Delete</button>
            </div>
        ))}
        {activities.length === 0 && <p className="no-activities-message">You have no current activities, click below to add one.</p>}
        {activities.length < 3 && <button onClick={handleAddClick} className="add-activity-button">Add Activity</button>}
        {showInput && (
            <form onSubmit={handleInputSubmit} className="activity-form">
                <label className="activity-label">
                    Enter Name Here:
                    <input type="text" value={inputValue} onChange={handleInputChange} className="activity-input" />
                </label>
                <button type="submit" className="submit-button">Submit</button>
            </form>
        )}
    </div>
  );
}

export default DComponentActivities;