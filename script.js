document.addEventListener("DOMContentLoaded", () => {
  const chatPopup = document.getElementById('chatPopup');
  const chatIcon = document.getElementById('chat-icon');
  const closeIcon = document.getElementById('close-icon'); 

    let chatInitialized = false; // Flag to check if the chat has been initialized
  
    function initializeChat() {
      displayInputMessage("Hi, I'm Fleet Enable's AI. Ask me anything for example:", "bot");
      displaySuggestions();
  
      document.getElementById("send-btn").addEventListener("click", () => {
        sendMessage();
        hideGreetingAndSuggestions(); // Hide greeting and suggestions after user clicks send
      });
  
      document.getElementById("user-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          sendMessage();
          hideGreetingAndSuggestions(); // Hide greeting and suggestions after user presses Enter
        }
      });
    }
  
    function displayInputMessage(data, sender) {
      const chatbox = document.getElementById("chatbox");
      const messageElem = document.createElement("div");
      messageElem.classList.add("message", sender);
      messageElem.innerHTML = data;
      chatbox.appendChild(messageElem);
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  
    function displaySuggestions() {
      const chatbox = document.getElementById("chatbox");
      const suggestions = [
        "What is the total revenue generated in May?",
        "How many orders are in exception status?",
        "How many orders are in dispatched statuses in May?",
        "What is our average revenue per order?"
      ];
  
      const suggestionContainer = document.createElement("div");
      suggestionContainer.classList.add("suggestions");
  
      suggestions.forEach(suggestion => {
        const suggestionElem = document.createElement("button");
        suggestionElem.classList.add("suggestion");
        suggestionElem.textContent = suggestion;
        suggestionElem.addEventListener("click", () => {
          document.getElementById("user-input").value = suggestion;
          sendMessage();
          hideGreetingAndSuggestions(); // Hide greeting and suggestions after user clicks on a suggestion
        });
        suggestionContainer.appendChild(suggestionElem);
      });
  
      chatbox.appendChild(suggestionContainer);
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  
    function sendMessage() {
      const userInput = document.getElementById("user-input").value;
      if (userInput.trim() === "") return;
    
      displayInputMessage(userInput, "user");
      document.getElementById("user-input").value = "";
      showLoadingDots();
    
      // Remove the suggestion container if it exists
      const suggestionContainer = document.querySelector(".suggestions");
      if (suggestionContainer) {
        suggestionContainer.remove();
      }
    
      fetch("http://127.0.0.1:8000/get_response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userInput
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          hideLoadingDots();
          console.log(data, "data");
          displayMessage(data, "bot");
        })
        .catch((error) => {
          hideLoadingDots();
          console.error("Error:", error);
        });
    }       
  
    function displayMessage(data, sender) {
      const chatbox = document.getElementById("chatbox");
    
      // Create a message container element
      const messageElem = document.createElement("div");
      messageElem.classList.add("message", sender);
    
      // Create a span element for displaying the message text
      const messageSpan = document.createElement("span");
    
      // Helper function to format a single dictionary
      const formatMessage = (messageObj) => {
        return Object.entries(messageObj)
          .map(([key, value]) => `<strong>${key}</strong>: ${value}`)
          .join("<br>");
      };
    
      let formattedMessage;
      let containsError = false;
    
      if (Array.isArray(data.message)) {
        // If data.message is an array, format each dictionary and check for errors
        formattedMessage = data.message
          .map((messageObj) => {
            if (messageObj.error) {
              containsError = true;
            }
            return formatMessage(messageObj);
          })
          .join("<br><br>");
      } else {
        // If data.message is a single dictionary, format it directly and check for errors
        const messageObj = JSON.parse(data.message);
        if (messageObj.error) {
          containsError = true;
        }
        formattedMessage = formatMessage(messageObj);
      }
    
      // Set the inner HTML of the span element with the formatted message
      messageSpan.innerHTML = formattedMessage;
    
      // Append the span element to the message container
      messageElem.appendChild(messageSpan);
    
      // Check if image_url exists and create an image element
      if (data.image_url) {
        const imageElem = document.createElement("img");
        imageElem.src = data.image_url;
        imageElem.alt = "Image";
        imageElem.style.maxWidth = "100%"; // Set a maximum width to ensure it fits within the chatbox
        imageElem.style.marginTop = "10px"; // Add some spacing between the text and image
        
        // Append the image element to the message container
        messageElem.appendChild(imageElem);
      }
    
      // Append the message element to the chatbox
      chatbox.appendChild(messageElem);  
      
      // Scroll to the bottom of the chatbox
      chatbox.scrollTop = chatbox.scrollHeight;
    }
       
    function showLoadingDots() {
      const chatbox = document.getElementById("chatbox");
      const loadingDots = document.createElement("div");
      loadingDots.id = "loading-dots";
      loadingDots.classList.add("loading");
      loadingDots.innerHTML = `
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      `;
      chatbox.appendChild(loadingDots);
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  
    function hideLoadingDots() {
      const loadingDots = document.getElementById("loading-dots");
      if (loadingDots) {
        loadingDots.remove();
      }
    }
  
    function hideGreetingAndSuggestions() {
      const suggestionsContainer = document.querySelector('.suggestions');
      if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none'; // Hide the suggestions container
      }
  
      const greetingMessage = document.querySelector('.message.bot');
      if (greetingMessage) {
        greetingMessage.style.display = 'none'; // Hide the greeting message
      }
    }
  
    window.toggleChatBot = function () {
  
      if (chatPopup.style.display === 'none' || chatPopup.style.display === '') {
          chatPopup.style.display = 'flex';
          chatIcon.style.display = 'none';
          closeIcon.style.display = 'block';
  
          if (!chatInitialized) {
              initializeChat(); // Initialize the chat only if it hasn't been initialized
              chatInitialized = true; // Set the flag to true after initialization
          }
      } else {
          chatPopup.style.display = 'none';
          chatIcon.style.display = 'block';
          closeIcon.style.display = 'none';
      }
    };
  
  });  
  
