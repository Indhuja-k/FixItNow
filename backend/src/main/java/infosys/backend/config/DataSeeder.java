package infosys.backend.config;

import infosys.backend.enums.BookingStatus;
import infosys.backend.enums.Role;
import infosys.backend.model.Booking;
import infosys.backend.model.ServiceProvider;
import infosys.backend.model.User;
import infosys.backend.repository.BookingRepository;
import infosys.backend.repository.ServiceRepository;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Configuration
@RequiredArgsConstructor
@Order(2)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        // Check if sample data already exists (check bookings instead of users)
        if (bookingRepository.count() > 0) {
            System.out.println("ℹ️ Sample booking data already exists. Skipping seeding.");
            return;
        }

        System.out.println("🌱 Seeding sample data...");

        // Create Providers
        List<User> providers = createProviders();
        
        // Create Customers
        List<User> customers = createCustomers();
        
        // Create Services for each provider
        List<ServiceProvider> services = createServices(providers);
        
        // Create Bookings
        createBookings(customers, providers, services);

        System.out.println("✅ Sample data seeding completed!");
        System.out.println("📊 Created: " + providers.size() + " providers, " + 
                          customers.size() + " customers, " + 
                          services.size() + " services, and bookings");
    }

    private List<User> createProviders() {
        List<User> providers = new ArrayList<>();
        String[][] providerData = {
            {"Rajesh Kumar", "rajesh@gmail.com", "Chennai", "9876543210"},
            {"Priya Sharma", "priya@gmail.com", "Salem", "9876543211"},
            {"Vijay Anand", "vijay@gmail.com", "Namakkal", "9876543212"},
            {"Lakshmi Devi", "lakshmi@gmail.com", "Erode", "9876543213"},
            {"Karthik Raja", "karthik@gmail.com", "Coimbatore", "9876543214"},
            {"Meena Bala", "meena@gmail.com", "Trichy", "9876543215"},
            {"Suresh Babu", "suresh@gmail.com", "Madurai", "9876543216"},
            {"Divya Rajan", "divya@gmail.com", "Tiruppur", "9876543217"},
            {"Arun Kumar", "arun@gmail.com", "Salem", "9876543218"},
            {"Kavitha Mani", "kavitha@gmail.com", "Namakkal", "9876543219"}
        };

        for (String[] data : providerData) {
            User provider = new User();
            provider.setName(data[0]);
            provider.setEmail(data[1]);
            provider.setLocation(data[2]);
            provider.setPassword(passwordEncoder.encode("password123"));
            provider.setRole(Role.PROVIDER);
            provider.setCreatedAt(LocalDateTime.now());
            providers.add(userRepository.save(provider));
        }

        return providers;
    }

    private List<User> createCustomers() {
        List<User> customers = new ArrayList<>();
        String[][] customerData = {
            {"Anitha Krishnan", "anitha@gmail.com", "Chennai"},
            {"Bala Murugan", "bala@gmail.com", "Salem"},
            {"Chitra Devi", "chitra@gmail.com", "Namakkal"},
            {"Dinesh Kumar", "dinesh@gmail.com", "Erode"},
            {"Esha Patel", "esha@gmail.com", "Coimbatore"},
            {"Ganesh Ravi", "ganesh@gmail.com", "Trichy"},
            {"Harini Swamy", "harini@gmail.com", "Madurai"},
            {"Indra Mohan", "indra@gmail.com", "Tiruppur"},
            {"Janani Reddy", "janani@gmail.com", "Salem"},
            {"Kiran Shetty", "kiran@gmail.com", "Namakkal"},
            {"Latha Nair", "latha@gmail.com", "Erode"},
            {"Muthu Kumar", "muthu@gmail.com", "Chennai"},
            {"Nithya Rao", "nithya@gmail.com", "Coimbatore"},
            {"Prakash Iyer", "prakash@gmail.com", "Salem"},
            {"Ramya Balaji", "ramya@gmail.com", "Namakkal"}
        };

        for (String[] data : customerData) {
            User customer = new User();
            customer.setName(data[0]);
            customer.setEmail(data[1]);
            customer.setLocation(data[2]);
            customer.setPassword(passwordEncoder.encode("password123"));
            customer.setRole(Role.CUSTOMER);
            customer.setCreatedAt(LocalDateTime.now());
            customers.add(userRepository.save(customer));
        }

        return customers;
    }

    private List<ServiceProvider> createServices(List<User> providers) {
        List<ServiceProvider> services = new ArrayList<>();
        
        String[][] serviceData = {
            // Category, Subcategory, Description, Price Range (min-max)
            {"Plumbing", "Pipe Repair", "Expert pipe repair and leak fixing", "300-800"},
            {"Plumbing", "Bathroom Fitting", "Complete bathroom fitting and installation", "1500-3000"},
            {"Plumbing", "Water Tank Cleaning", "Professional water tank cleaning service", "500-1200"},
            {"Electrical", "Wiring Installation", "Safe and certified electrical wiring", "800-2000"},
            {"Electrical", "Fan Installation", "Ceiling and exhaust fan installation", "200-500"},
            {"Electrical", "AC Repair", "Air conditioner repair and maintenance", "500-1500"},
            {"Electrical", "Switch Board Repair", "Electrical switch and board fixing", "150-400"},
            {"Carpentry", "Furniture Repair", "Professional furniture repair service", "400-1000"},
            {"Carpentry", "Door Installation", "Door fitting and installation", "1000-2500"},
            {"Carpentry", "Cabinet Making", "Custom cabinet design and installation", "2000-5000"},
            {"Cleaning", "House Cleaning", "Complete house deep cleaning", "800-2000"},
            {"Cleaning", "Kitchen Cleaning", "Professional kitchen cleaning service", "500-1200"},
            {"Cleaning", "Office Cleaning", "Commercial office cleaning", "1000-2500"},
            {"Painting", "Wall Painting", "Interior and exterior wall painting", "2000-5000"},
            {"Painting", "Furniture Painting", "Furniture repainting and finishing", "500-1500"},
            {"Appliance Repair", "Washing Machine Repair", "Washing machine repair service", "300-800"},
            {"Appliance Repair", "Refrigerator Repair", "Fridge repair and maintenance", "500-1200"},
            {"Gardening", "Lawn Maintenance", "Regular lawn care and maintenance", "600-1500"},
            {"Pest Control", "Termite Control", "Professional termite treatment", "1500-3000"},
            {"Home Security", "CCTV Installation", "Security camera installation", "3000-8000"}
        };

        for (User provider : providers) {
            // Each provider gets 2-3 random services
            int numServices = 2 + random.nextInt(2);
            List<Integer> usedIndices = new ArrayList<>();
            
            for (int i = 0; i < numServices; i++) {
                int index;
                do {
                    index = random.nextInt(serviceData.length);
                } while (usedIndices.contains(index));
                usedIndices.add(index);
                
                String[] data = serviceData[index];
                String[] priceRange = data[3].split("-");
                int minPrice = Integer.parseInt(priceRange[0]);
                int maxPrice = Integer.parseInt(priceRange[1]);
                int price = minPrice + random.nextInt(maxPrice - minPrice + 1);
                
                ServiceProvider service = new ServiceProvider();
                service.setProvider(provider);
                service.setCategory(data[0]);
                service.setSubcategory(data[1]);
                service.setDescription(data[2] + " - Experienced professional with 5+ years expertise");
                service.setPrice(new BigDecimal(price));
                service.setLocation(provider.getLocation());
                service.setAvailability("Mon-Sat 9am-6pm");
                service.setCreatedAt(LocalDateTime.now());
                services.add(serviceRepository.save(service));
            }
        }

        return services;
    }

    private void createBookings(List<User> customers, List<User> providers, List<ServiceProvider> services) {
        BookingStatus[] statuses = {BookingStatus.COMPLETED, BookingStatus.PENDING, BookingStatus.CONFIRMED};
        String[] timeSlots = {"9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", 
                             "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM"};
        
        // Create 30-40 bookings
        int numBookings = 30 + random.nextInt(11);
        
        for (int i = 0; i < numBookings; i++) {
            User customer = customers.get(random.nextInt(customers.size()));
            ServiceProvider service = services.get(random.nextInt(services.size()));
            User provider = service.getProvider();
            
            Booking booking = new Booking();
            booking.setCustomer(customer);
            booking.setProvider(provider);
            booking.setService(service);
            
            // Random booking date within last 30 days
            LocalDate bookingDate = LocalDate.now().minusDays(random.nextInt(30));
            booking.setBookingDate(bookingDate);
            booking.setTimeSlot(timeSlots[random.nextInt(timeSlots.length)]);
            
            // Random status with higher chance of completed
            BookingStatus status = statuses[random.nextInt(statuses.length)];
            booking.setStatus(status);
            
            if (status == BookingStatus.COMPLETED) {
                booking.setProviderMarkedComplete(true);
                booking.setCustomerVerified(random.nextBoolean());
            }
            
            booking.setCreatedAt(LocalDateTime.now().minusDays(random.nextInt(30)));
            bookingRepository.save(booking);
        }
    }
}
