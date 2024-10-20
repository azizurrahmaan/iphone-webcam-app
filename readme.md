# iPhone Camera Web App

## Overview

This project is a web application that allows users to capture photos using their device's camera and upload them to a server. It utilizes WebSocket for real-time communication and provides a user-friendly interface for camera switching and angle adjustment.

## Features

- Capture photos from the device camera.
- Switch between front and back cameras.
- Real-time connection status updates.
- Device orientation handling to ensure proper camera usage.
- Upload captured photos to the server.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express, WebSocket
- **File Upload**: Multer
- **WebSocket**: ws

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/azizurrahmaan/iphone-webcam-app
   cd iphone-webcam-app
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create an `uploads` directory in the root of the project to store uploaded images:

   ```bash
   mkdir uploads
   ```

4. Start the server:

   ```bash
   node server.js
   ```

5. Open your browser and navigate to `http://localhost:3000` to access the application.

## Usage

- Upon loading the application, the camera will initialize automatically.
- Click the "Capture Photo" button to take a photo.
- Use the "Switch Camera" button to toggle between the front and back cameras.
- Adjust the device angle as prompted to ensure optimal camera usage.

## Permissions

The application requires permission to access the device camera and orientation sensors. Users will be prompted to grant these permissions upon loading the app.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the developers of the libraries and frameworks used in this project.
- Special thanks to the open-source community for their contributions.