package infosys.backend.service;

import infosys.backend.model.User;
import infosys.backend.repository.BookingRepository;
import infosys.backend.repository.ReviewRepository;
import infosys.backend.repository.ServiceRepository;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final ServiceRepository serviceRepository;

    // 🔹 Read all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 🔹 Read user by id
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // 🔹 Read user by email
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    // 🔹 Update user
    public User updateUser(Long id, User updatedUser) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existing.setName(updatedUser.getName());
        existing.setEmail(updatedUser.getEmail());
        existing.setLocation(updatedUser.getLocation());
        existing.setRole(updatedUser.getRole());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existing.setPassword(updatedUser.getPassword());
        }

        return userRepository.save(existing);
    }

    // 🔹 Delete user
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

    // 2️⃣ Delete all bookings where this user is customer or provider
    bookingRepository.deleteByCustomerId(id);
    bookingRepository.deleteByProviderId(id);

    // 3️⃣ Delete all reviews where this user is customer or provider
    reviewRepository.deleteByCustomerId(id);
    reviewRepository.deleteByProviderId(id);

    serviceRepository.deleteByProviderId(id);

    // 4️⃣ Delete the user (services will be deleted automatically because of cascade)
    userRepository.deleteById(id);
    }

    public User findByUsername(String username) {
    return userRepository.findByName(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
}

public String getRole(Long id) {
        User user = getUserById(id);
        return user.getRole().name();
    }
}
