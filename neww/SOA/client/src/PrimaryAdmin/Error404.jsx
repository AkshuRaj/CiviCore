import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Error404 = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <motion.div
        animate={{ y: [0, -20, 0] }} // Animates the y position: start 0, up 20px, back to 0
        transition={{
          duration: 2,
          repeat: Infinity, // Repeats the animation forever
          ease: "easeInOut",
        }}
        style={{ fontSize: "150px", fontWeight: "bold", color: "#ff6347" }}
      >
        404
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Look like you're lost
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        The page you are looking for not available!
      </motion.p>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 100 }}
      >
        <Link
          to="/adminlogin"
          style={{
            color: "#fff",
            padding: "10px 20px",
            background: "#39ac31",
            margin: "20px 0",
            display: "inline-block",
            borderRadius: "5px",
            textDecoration: "none",
          }}
        >
          Go to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default Error404;
