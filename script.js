function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const main = document.querySelector(".main-content");
  sidebar.classList.toggle("collapsed");
  main.classList.toggle("expanded");
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => page.classList.add("hidden"));
  const selected = document.getElementById(pageId);
  if (selected) selected.classList.remove("hidden");
}

// ROS setup
let ros = new ROSLIB.Ros({
  url: 'ws://localhost:9090'
});

ros.on('connection', () => {
  document.getElementById("network-status").innerText = "Connected ✅";
});

ros.on('error', (error) => {
  document.getElementById("network-status").innerText = "Connection Error ❌";
  console.error(error);
});

ros.on('close', () => {
  document.getElementById("network-status").innerText = "Connection Closed ⚠️";
});

function moveRobot(direction) {
  let cmdVel = new ROSLIB.Topic({
    ros: ros,
    name: '/cmd_vel',
    messageType: 'geometry_msgs/Twist'
  });

  let twist = new ROSLIB.Message({
    linear: {
      x: direction === 'forward' ? 1 : direction === 'backward' ? -1 : 0,
      y: 0,
      z: 0
    },
    angular: {
      x: 0,
      y: 0,
      z: direction === 'left' ? 1 : direction === 'right' ? -1 : 0
    }
  });

  cmdVel.publish(twist);
}

function saveSettings() {
  const topic = document.getElementById("topic").value;
  document.getElementById("ros-topic").innerText = topic;
}

function updateBattery() {
  let battery = Math.floor(Math.random() * 50) + 50 + "%";
  document.getElementById("battery-level").innerText = "Battery: " + battery;
}
setInterval(updateBattery, 5000);

document.addEventListener("DOMContentLoaded", () => {
  // Initialize ROS3D viewer
  const viewer = new ROS3D.Viewer({
    divID: "map-container",
    width: 800,
    height: 400,
    background: "#222"
  });

  // TF Client for transforms
  const tfClient = new ROSLIB.TFClient({
    ros: ros,
    fixedFrame: 'map',
    angularThres: 0.01,
    transThres: 0.01,
    rate: 10.0
  });

  // ✅ Add LaserScan display
  new ROS3D.LaserScan({
    ros: ros,
    tfClient: tfClient,
    rootObject: viewer.scene,
    topic: '/scan',
    material: { color: 0xff0000, size: 0.05 }
  });

  // Load Occupancy Grid Map
  new ROS3D.OccupancyGridClient({
    ros: ros,
    rootObject: viewer.scene,
    continuous: true
  });

  // Load Robot Model (URDF)
  new ROS3D.UrdfClient({
    ros: ros,
    tfClient: tfClient,
    path: 'http://localhost:8000/',  // Replace with correct path to mesh files
    rootObject: viewer.scene
  });

  // Subscribe to LiDAR
  let lidar = new ROSLIB.Topic({
    ros: ros,
    name: '/scan',
    messageType: 'sensor_msgs/LaserScan'
  });

  lidar.subscribe(msg => {
    document.getElementById("sensor-data").innerText = `Lidar Range: ${msg.ranges[0].toFixed(2)} m`;
  });

  // Subscribe to Odometry
  let odom = new ROSLIB.Topic({
    ros: ros,
    name: '/odom',
    messageType: 'nav_msgs/Odometry'
  });

  odom.subscribe(msg => {
    const { x, y } = msg.pose.pose.position;
    document.getElementById("ros-topic").innerText = `/odom (x: ${x.toFixed(2)}, y: ${y.toFixed(2)})`;
  });

  showPage('home'); // Default page
});
