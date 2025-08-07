import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import "./EditPriorityTags.css"
const tagOptions = {
  complexity: [
    "Low Complexity Focus Task",
    "Low Complexity - Less Context Switching",
    "Medium Complexity Task - Focus Task",
    "Moderate Collaboration and Context Switching",
    "High Complexity Task - Focus Task",
    "High Collaboration and Conext Switching",
    "Wait Likely for Key Decisions/Inputs",
    "Depends on another task to be completed",
    "Blocks another task",
    "Someone is Waiting for this to completed faster",
    "Requires Research",
    "Not a Routine Task",
    "Groundbreaking Work",
    "Intense Focus Needed"
  ],
  type: [
    "Planned Technical Work",
    "Project Delivery Work",
    "Strategic Work",
    "Innovation/Creative Work",
    "Deliverable/Documentation",
    "Deadline",
    "Issue Resolution",
    "Escalated Problem",
    "Planned Non-Technical Work",
    "Group Task",
    "Collaboration",
    "Design Work",
    "Solution Development",
    "Creative Thinking"
  ],
  category: [
    "Sales - Qualification",
    "Marketing - Awareness",
    "R&D/Engineering",
    "Quality Assurance/Quality Control",
    "Operations",
    "Management/Leadership",
    "Meeting/Discussion Actions or Follow up",
    "Customer/Partner Engagement",
    "Vendor/Supplier Engagement",
    "Personal - Self",
    "Relationship Building",
    "Customer Retention/Recovery",
    "Personal Family",
    "Personal - Health",
    "Personal - Financial",
    "Marketing - Demand Generation",
    "Technology implementation/Evaluation",
    "Sales Closing/Negotiation"
  ],
  impact: [
    "Increase Revenue- Incremental",
    "Increase Revenue - Multiplier",
    "Save Costs",
    "Safety",
    "Compliance",
    "Legal Risk",
    "Growth Potential",
    "Increase Market Share",
    "Expand Market Reach",
    "Employee Experience",
    "Customer Experience"
  ]
};

function EditPriorityTags({ open, onClose, task, onSave }) {
  const [tags, setTags] = useState({
    complexity: [],
    type: [],
    category: [],
    impact: []
  });

  useEffect(() => {
    if (task && task.priority_tags) {
      setTags(task.priority_tags);
    }
  }, [task]);
  
  useEffect(() => {
  if (!open) {
    setTags({
      complexity: [],
      type: [],
      category: [],
      impact: []
    });
  }
}, [open]);

  const handleChange = (group) => (event) => {
    setTags(prev => ({
      ...prev,
      [group]: event.target.value
    }));
  };

  const handleSubmit = () => {
    const updatedTask = {
      ...task,
      priority_tags: tags
    };
    onSave(updatedTask);

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Priority Tags</DialogTitle>
      <DialogContent dividers>
        {Object.entries(tagOptions).map(([group, options]) => (
          <FormControl fullWidth style={{ marginBottom: 20 }} key={group}>
            <InputLabel>{group.charAt(0).toUpperCase() + group.slice(1)}</InputLabel>
           <Select
                multiple
                value={tags[group]}
                onChange={handleChange(group)}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={{
                    PaperProps: {
                    style: {
                        maxHeight: 300,
                        width: 600,
                    },
                    },
                }}
                >

              {options.map((option) => (
                <MenuItem key={option} value={option} >
                  <Checkbox checked={tags[group]?.includes(option)} />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} style={{ background: "#a1a1a1", color: "white" }}>Cancel</Button>
        <Button onClick={handleSubmit} style={{ background: "#0b87b1", color: "white" }}>Save Tags</Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditPriorityTags;
