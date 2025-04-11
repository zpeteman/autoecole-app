# Auto École Application

A modern web application for managing driving schools, built with Fresh (Deno) and Preact.

## Features

- **Student Management**
  - Add, edit, and view student details
  - Track student progress and status
  - Manage student documents (CIN, driving license)
  - Export student information as PDF

- **Exam Management**
  - Schedule and track driving exams
  - Record exam results and notes
  - View exam history per student
  - Export exam data as CSV

- **Payment Management**
  - Record student payments
  - Track payment status and history
  - Generate payment reports
  - Export payment data as CSV

- **Statistics and Reporting**
  - View overall statistics
  - Filter data by time periods
  - Export comprehensive reports
  - Track success rates

## Technologies Used

- [Fresh](https://fresh.deno.dev/) - The next-gen web framework
- [Deno](https://deno.land/) - A secure runtime for JavaScript and TypeScript
- [Preact](https://preactjs.com/) - Fast 3kB alternative to React
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [jsPDF](https://github.com/parallax/jsPDF) - Client-side PDF generation

## Prerequisites

- [Deno](https://deno.land/manual/getting_started/installation) (version 1.31.0 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/autoecole-app.git
cd autoecole-app
```

2. Start the development server:
```bash
deno task start
```

The application will be available at `http://localhost:8000`

## Project Structure

```
autoecole-app/
├── components/     # Reusable UI components
├── db/            # Database and type definitions
├── islands/       # Interactive Preact components
├── routes/        # Application routes
├── static/        # Static assets
└── utils/         # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
