import com.seenotify.NotificationPackage;

public class MainApplication extends Application {

    @Override
    protected List<ReactPackage> getPackages() {
        List<ReactPackage> packages = new ArrayList<>();
        packages.add(new NotificationPackage());
        return packages;
    }
} 