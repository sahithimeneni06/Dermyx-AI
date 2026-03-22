"""
check_env.py — Run this first to see exactly what's broken.

Usage:
    python check_env.py
"""
import sys
import subprocess

print("=" * 55)
print("Dermyx AI — Environment Diagnostic")
print("=" * 55)
print(f"Python: {sys.version}")
print(f"Executable: {sys.executable}")
print()

PACKAGES = [
    ("numpy",       "1.24.3"),
    ("tensorflow",  "2.12.0"),
    ("flask",       "2.3.3"),
    ("flask_cors",  "4.0.0"),
    ("PIL",         None),      # Pillow
    ("sklearn",     None),      # scikit-learn
    ("torch",       None),
    ("timm",        None),
]

ok = True
for pkg, required in PACKAGES:
    try:
        mod = __import__(pkg)
        ver = getattr(mod, "__version__", "unknown")
        status = "✅"
        note = ""
        if required and ver != required:
            status = "⚠️ "
            note = f"  ← expected {required}"
            ok = False
        print(f"  {status} {pkg:<20} {ver}{note}")
    except ImportError as e:
        print(f"  ❌ {pkg:<20} NOT INSTALLED  ({e})")
        ok = False

print()

# Specific numpy/tensorflow compat check
print("Compatibility check:")
try:
    import numpy as np
    np_major = int(np.__version__.split(".")[0])
    np_minor = int(np.__version__.split(".")[1])
    if np_major >= 2:
        print("  ❌ numpy >= 2.0 is INCOMPATIBLE with tensorflow <= 2.15")
        print("     Fix: pip install numpy==1.24.3")
        ok = False
    else:
        print(f"  ✅ numpy {np.__version__} is compatible")
except Exception as e:
    print(f"  ❌ numpy check failed: {e}")
    ok = False

try:
    import numpy.core.umath  # noqa: F401
    print("  ✅ numpy.core.umath OK")
except ImportError as e:
    print(f"  ❌ numpy.core.umath: {e}")
    print("     Fix: pip install numpy==1.24.3")
    ok = False

print()
if ok:
    print("✅ All good — run: python app.py")
else:
    print("❌ Issues found. Fix with:")
    print()
    print("   # Option A — use the batch script:")
    print("   fix_env.bat")
    print()
    print("   # Option B — manual fix:")
    print("   pip install numpy==1.24.3 tensorflow==2.12.0")
    print()
print("=" * 55)