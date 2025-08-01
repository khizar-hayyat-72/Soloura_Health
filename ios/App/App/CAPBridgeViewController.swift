import UIKit
import Capacitor

// 1. Give the class a unique name and inherit from the original CAPBridgeViewController
class CustomCAPBridgeViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        // --- START: Custom Status Bar Background Code ---

        let statusBarView = UIView()
        statusBarView.backgroundColor = .white // Or any color you want
        statusBarView.tag = 123 // Unique tag to find it later

        // The 'view' property is now available because we are inheriting correctly
        view.addSubview(statusBarView)

        statusBarView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            statusBarView.topAnchor.constraint(equalTo: view.topAnchor),
            statusBarView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            statusBarView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            statusBarView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor)
        ])

        // --- END: Custom Status Bar Background Code ---
    }
}
