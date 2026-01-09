import mediapipe as mp
print(f"Mediapipe attributes: {dir(mp)}")
try:
    import mediapipe.python.solutions as solutions
    print("Direct import of solutions successful")
    mp.solutions = solutions
except ImportError as e:
    print(f"Direct import failed: {e}")

try:
    print(mp.solutions)
    print("Mediapipe solutions found")
except AttributeError as e:
    print(f"Error: {e}")
    print(f"Mediapipe file: {mp.__file__}")
