import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useFirstLaunch = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("has_launched");
        if (hasLaunched === null) {
          await AsyncStorage.setItem("has_launched", "true");
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch {
        setIsFirstLaunch(false);
      }
    };
    check();
  }, []);

  return true;
};
