{{ fullname | escape | underline }}

.. currentmodule:: {{ module }}

.. autoclass:: {{ objname }}

   {% block methods %}
   .. automethod:: __init__

   {% if methods %}
   .. rubric:: {{ _('Methods') }}

   .. autosummary::
      :toctree: _generated/

   {% for item in methods %}
       {% if item != "__init__" %}
          {{ objname }}.{{ item }}
       {% endif %}
   {%- endfor %}
   {% endif %}
   {% endblock %}

   {% block attributes %}
   {% if attributes %}
   .. rubric:: {{ _('Attributes') }}

   .. autosummary::
      :toctree: _generated/

   {% for item in attributes %}
      {{ objname }}.{{ item }}
   {%- endfor %}
   {% endif %}
   {% endblock %}
