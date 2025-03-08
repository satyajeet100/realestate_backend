import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CardMedia,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  TextField,
  ListItemAvatar,
  Avatar,
  TextField as MuiTextField,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const API_URL = "http://localhost:9090";

const AdminDashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [editedRoles, setEditedRoles] = useState({});
  const [activeTab, setActiveTab] = useState("users");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [todoDate, setTodoDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch users
    axios
      .get(`${API_URL}/users`)
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));

    // Fetch properties
    axios
      .get(`${API_URL}/api/properties/all`)
      .then((response) => setProperties(response.data))
      .catch((error) => console.error("Error fetching properties:", error));

    // Fake todos data
    setTodos([
      { id: 1, task: "Meeting with team", date: "2025-03-10T10:00" },
      { id: 2, task: "Review project updates", date: "2025-03-12T14:00" },
    ]);
  }, []);

  // Role-specific messages: initial query and a list of subsequent replies
  const roleMessages = {
    BUYER: {
      initialQuery: "Hi, I’m looking for a 3-bedroom house in the Bellandur area. Any suggestions?",
      replies: [
        "Yes, please! Can you send me some options?",
        "What is the price range near that area? I want to buy one property as I will probably be shifting next month with my family",
        "35k-55k. We can negotiate after the property selection",
        "Nice, any with a garage?",
        "Cool, how’s the neighborhood?",
      ],
    },
    SELLER: {
      initialQuery: "Hi, how do I list my property on your platform?",
      replies: [
        "Thanks! Could you guide me through the form?",
        "Perfect, how long does approval take?",
        "Got it, what’s the listing fee?",
        "Alright, can I upload photos?",
        "Good, how do I track inquiries?",
      ],
    },
    AGENT: {
      initialQuery: "Can you provide me with the latest market trends for my clients?",
      replies: [
        "That’s helpful! Can I get a detailed report?",
        "Awesome, can you email it to me?",
        "Thanks, what about last quarter?",
        "Nice, any predictions for next month?",
        "Great, how do I share this with clients?",
      ],
    },
    ADMIN: {
      initialQuery: "I need to update the system settings. Where do I start?",
      replies: [
        "Got it! How do I adjust user Role",
        "Thanks, what about adding new users?",
        "Cool, can I change the theme?",
        "Nice, how do I backup data?",
        "Good, What about future meetings?",
      ],
    },
  };

  // Simulate initial user query only
  useEffect(() => {
    if (selectedUser) {
      const { initialQuery } = roleMessages[selectedUser.role] || {
        initialQuery: "Hi, I have a general question!",
      };
      setMessages([
        {
          id: 1,
          senderId: selectedUser.id,
          receiverId: "admin",
          message: initialQuery,
          timestamp: new Date().toISOString(),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  const handleRoleChange = (id, newRole) => {
    setEditedRoles((prev) => ({ ...prev, [id]: newRole }));
  };

  const saveRoleChange = (id) => {
    if (!editedRoles[id]) return;
    axios
      .put(
        `${API_URL}/users/${id}/role`,
        { role: editedRoles[id] },
        { headers: { "Content-Type": "application/json" } }
      )
      .then(() => {
        setUsers(users.map((user) => (user.id === id ? { ...user, role: editedRoles[id] } : user)));
        setEditedRoles((prev) => {
          const updatedRoles = { ...prev };
          delete updatedRoles[id];
          return updatedRoles;
        });
      })
      .catch((error) => console.error("Error updating user role:", error));
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const handleDeleteProperty = (id) => {
    axios
      .delete(`${API_URL}/api/properties/${id}`)
      .then(() => {
        setProperties(properties.filter((property) => property.id !== id));
      })
      .catch((error) => console.error("Error deleting property:", error));
  };

  const handleUpdateStatus = (id, newStatus) => {
    axios
      .put(
        `${API_URL}/api/properties/${id}/status`,
        { status: newStatus },
        { headers: { "Content-Type": "application/json" } }
      )
      .then(() => {
        setProperties(properties.map((property) => (property.id === id ? { ...property, status: newStatus } : property)));
      })
      .catch((error) => console.error("Error updating property status:", error));
  };

  // Admin reply with infinite automatic user replies
  const handleSendReply = () => {
    if (!replyText.trim() || !selectedUser) return;

    const newAdminMessage = {
      id: messages.length + 1,
      senderId: "admin",
      receiverId: selectedUser.id,
      message: replyText,
      timestamp: new Date().toISOString(),
    };

    const { replies } = roleMessages[selectedUser.role] || {
      replies: [
        "Cool, can you tell me more?",
        "Thanks, anything else I should know?",
        "Great, what’s next?",
        "Nice, can you clarify?",
        "Good, any updates?",
      ],
    };

    // Calculate the index of the next user reply (cycle through replies)
    const userReplyCount = messages.filter((msg) => msg.senderId !== "admin").length;
    const nextReplyIndex = userReplyCount % replies.length;
    const nextUserReply = replies[nextReplyIndex];

    const newUserMessage = {
      id: messages.length + 2,
      senderId: selectedUser.id,
      receiverId: "admin",
      message: nextUserReply,
      timestamp: new Date(Date.now() + 1000).toISOString(), // 1-second delay
    };

    setMessages([...messages, newAdminMessage, newUserMessage]);
    setReplyText("");
  };

  const handleAddTodo = () => {
    if (!newTodo.trim() || !todoDate) return;
    const newTodoItem = { id: todos.length + 1, task: newTodo, date: todoDate };
    setTodos([...todos, newTodoItem]);
    setNewTodo("");
    setTodoDate("");
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const getPropertyTypeDistribution = () => {
    const typeCounts = properties.reduce((acc, property) => {
      acc[property.propertyType] = (acc[property.propertyType] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(typeCounts).map((type) => ({ name: type, value: typeCounts[type] }));
  };

  const getPriceFluctuationData = () => {
    const sortedProperties = [...properties].sort((a, b) => a.price - b.price);
    return sortedProperties.map((property) => ({ name: property.propertyTitle, price: property.price }));
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#123456" }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>Admin Dashboard</Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{ width: 240, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" } }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => setActiveTab("users")}>
            <ListItemText primary="Users" />
          </ListItem>
          <ListItem button onClick={() => setActiveTab("properties")}>
            <ListItemText primary="Properties" />
          </ListItem>
          <ListItem button onClick={() => setActiveTab("messages")}>
            <ListItemText primary="Messages" />
          </ListItem>
          <ListItem button onClick={() => setActiveTab("todos")}>
            <ListItemText primary="To-Do" />
          </ListItem>
          <ListItem button onClick={handleLogout} sx={{ mt: "auto" }}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />

        {activeTab === "users" && (
          <TableContainer component={Paper} sx={{ mt: 3, p: 2, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>Users List</Typography>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#e0e0e0" }}>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Role</b></TableCell>
                  <TableCell><b>Created At</b></TableCell>
                  <TableCell><b>Updated At</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id} sx={{ bgcolor: index % 2 ? "#fafafa" : "#ffffff" }}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>{user.updatedAt}</TableCell>
                    <TableCell>
                      <Select value={editedRoles[user.id] || user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                        <MenuItem value="BUYER">Buyer</MenuItem>
                        <MenuItem value="SELLER">Seller</MenuItem>
                        <MenuItem value="AGENT">Agent</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                      </Select>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => saveRoleChange(user.id)}
                        disabled={!editedRoles[user.id] || editedRoles[user.id] === user.role}
                      >
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === "properties" && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>Properties Overview</Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
              <Paper sx={{ p: 2, flex: 1, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Property Types Distribution</Typography>
                <PieChart width={400} height={300}>
                  <Pie data={getPropertyTypeDistribution()} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                    {getPropertyTypeDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Price Fluctuation</Typography>
                <LineChart width={500} height={300} data={getPriceFluctuationData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </Paper>
            </Box>
            <TableContainer component={Paper} sx={{ mt: 3, p: 2, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>Properties List</Typography>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#e0e0e0" }}>
                    <TableCell><b>Image</b></TableCell>
                    <TableCell><b>Title</b></TableCell>
                    <TableCell><b>Location</b></TableCell>
                    <TableCell><b>Description</b></TableCell>
                    <TableCell><b>Price</b></TableCell>
                    <TableCell><b>Discounted Price</b></TableCell>
                    <TableCell><b>Discount Percent</b></TableCell>
                    <TableCell><b>Property Type</b></TableCell>
                    <TableCell><b>Property Category</b></TableCell>
                    <TableCell><b>Number of Bedrooms</b></TableCell>
                    <TableCell><b>Number of Bathrooms</b></TableCell>
                    <TableCell><b>Square Feet</b></TableCell>
                    <TableCell><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.map((property, index) => (
                    <TableRow key={property.id} sx={{ bgcolor: index % 2 ? "#fafafa" : "#ffffff" }}>
                      <TableCell>
                        <CardMedia
                          component="img"
                          height="100"
                          image={property.imageUrls?.[0] || "default-image-url.jpg"}
                          alt={property.propertyTitle}
                          sx={{ objectFit: "cover", borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell>{property.propertyTitle}</TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell>{property.description}</TableCell>
                      <TableCell>Rs {property.price}</TableCell>
                      <TableCell>{property.discountedPrice}</TableCell>
                      <TableCell>{property.discountPercent}</TableCell>
                      <TableCell>{property.propertyType}</TableCell>
                      <TableCell>{property.propertyCategory}</TableCell>
                      <TableCell>{property.numberOfBedrooms}</TableCell>
                      <TableCell>{property.numberOfBathrooms}</TableCell>
                      <TableCell>{property.squareFeet}</TableCell>
                      <TableCell>
                        <Button variant="contained" color="error" onClick={() => handleDeleteProperty(property.id)} sx={{ mb: 1 }}>
                          Delete
                        </Button>
                        <Select value={property.status || "ACTIVE"} onChange={(e) => handleUpdateStatus(property.id, e.target.value)} fullWidth>
                          <MenuItem value="ACTIVE">Active</MenuItem>
                          <MenuItem value="INACTIVE">Inactive</MenuItem>
                          <MenuItem value="SOLD">Sold</MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === "messages" && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>Messages</Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Paper sx={{ width: 240, p: 2, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Users</Typography>
                <List>
                  {users.map((user) => (
                    <ListItem
                      button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      selected={selectedUser?.id === user.id}
                    >
                      <ListItemText primary={user.name} secondary={user.role} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              <Paper sx={{ flex: 1, p: 2, borderRadius: 2, boxShadow: 3, display: "flex", flexDirection: "column" }}>
                {selectedUser ? (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>Chat with {selectedUser.name}</Typography>
                    <Box sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "400px", mb: 2 }}>
                      {messages.map((message) => (
                        <Box
                          key={message.id}
                          sx={{
                            display: "flex",
                            justifyContent: message.senderId === "admin" ? "flex-end" : "flex-start",
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: "60%",
                              bgcolor: message.senderId === "admin" ? "#DCF8C6" : "#E0E0E0",
                              p: 1,
                              borderRadius: 2,
                              boxShadow: 1,
                            }}
                          >
                            <Typography variant="body2">{message.message}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type your message..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && replyText.trim()) {
                            handleSendReply();
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                      >
                        Send
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: "center", mt: 2 }}>
                    Select a user to start chatting.
                  </Typography>
                )}
              </Paper>
            </Box>
          </Box>
        )}

        {activeTab === "todos" && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>To-Do List</Typography>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <MuiTextField
                  fullWidth
                  variant="outlined"
                  placeholder="Add a new task..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                />
                <MuiTextField
                  type="datetime-local"
                  value={todoDate}
                  onChange={(e) => setTodoDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
                <Button variant="contained" color="primary" onClick={handleAddTodo} disabled={!newTodo || !todoDate}>
                  Add
                </Button>
              </Box>
              <List>
                {todos.map((todo) => (
                  <ListItem
                    key={todo.id}
                    secondaryAction={
                      <Button variant="outlined" color="error" onClick={() => handleDeleteTodo(todo.id)}>
                        Delete
                      </Button>
                    }
                  >
                    <ListItemText primary={todo.task} secondary={new Date(todo.date).toLocaleString()} />
                  </ListItem>
                ))}
              </List>
              {todos.length === 0 && (
                <Typography variant="body1" sx={{ textAlign: "center", mt: 2 }}>No tasks scheduled yet.</Typography>
              )}
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;