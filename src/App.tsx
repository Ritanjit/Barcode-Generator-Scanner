// src\App.tsx
import { Routes, Route } from "react-router";
import EnhancedBarcodeToolkit from "@/widgets/BarcodeScanner/BarcodeTools";

function App() {
	return (
		<>
			<Routes>
				<Route index element={<EnhancedBarcodeToolkit />} />
			</Routes>
		</>
	);
}

export default App;
